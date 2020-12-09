import CompletedAreaSettingTab from "./CompletedAreaSettingTab";
import CompletedAreaSetting from "./CompletedAreaSetting";
import { Plugin, Notice } from "obsidian";

export default class CompletedAreaPlugin extends Plugin {
	public setting: CompletedAreaSetting;
	public completedItemRegx: RegExp = /(\n?- \[x\] .*)/g;
	public keyPressed: any = {};
	public completedAreaHeader: string;

	async onload() {
		this.setting = new CompletedAreaSetting();
		await this.loadSetting();

		if (this.setting.showIcon) {
			this.addRibbonIcon("dice", "Completed Area", () => {
				this.processCompletedItems();
			});
		}

		this.registerEvent(
			this.app.on("codemirror", (cm: CodeMirror.Editor) => {
				cm.on("keydown", this.handleKeyDown);
				cm.on("keyup", this.handleKeyUp);
			})
		);

		this.addCommand({
			id: "completed-area-shortcut",
			name: "Extracted completed items.",
			callback: () => this.processCompletedItems(),
		});

		this.addSettingTab(new CompletedAreaSettingTab(this.app, this));
	}

	isHotkeyDown(): boolean {
		const { first, second, third } = this.setting.hotkey;
		return (
			(first === "Empty" ? true : this.keyPressed[first]) &&
			this.keyPressed[second] &&
			this.keyPressed[third]
		);
	}

	handleKeyDown = (cm: CodeMirror.Editor, event: KeyboardEvent): void => {
		this.keyPressed[event.key] = true;
		console.log(this.keyPressed);
		if (this.isHotkeyDown()) {
			setTimeout(() => {
				this.processCompletedItems(true);
			}, 10);
		}
	};

	handleKeyUp = (cm: CodeMirror.Editor, event: KeyboardEvent): void => {
		this.keyPressed = {};
	};

	async processCompletedItems(triggeredByKey: boolean = false) {
		const activeLeaf = this.app.workspace.activeLeaf ?? null;
		const source = activeLeaf.view.sourceMode;
		const sourceContent = source.get();
		const completedItems =
			this.extractCompletedItems(sourceContent, triggeredByKey) ?? null;
		if (completedItems) {
			const newContent = this.refactorContent(sourceContent, completedItems);
			source.set(newContent, false);
		}
	}

	async loadSetting() {
		const loadedSetting = await this.loadData();
		if (loadedSetting) {
			this.setting.completedAreaHierarchy =
				loadedSetting.completedAreaHierarchy;
			this.setting.completedAreaName = loadedSetting.completedAreaName;
			this.setting.todoAreaName = loadedSetting.todoAreaName;
			this.setting.showIcon = loadedSetting.showIcon;
			this.setting.hotkey = loadedSetting.hotkey;
		} else {
			this.saveData(this.setting);
		}
	}

	extractCompletedItems(
		text: string,
		triggeredByKey: boolean = false
	): Array<string> | void {
		let completedItems: Array<string> = [];

		if (text) {
			completedItems = text.match(this.completedItemRegx);

			if (!completedItems && !triggeredByKey) {
				new Notice("No completed todos found.");
				return;
			}

			return completedItems;
		} else if (!triggeredByKey) {
			new Notice("This is an empty note.");
		}
	}

	refactorContent(content: string, items: Array<string>): string {
		const completedArea = this.formatItems(items, content);
		console.log(completedArea);
		const header = this.completedAreaHeader.trimStart();
		let newContent = content
			.replace(this.completedItemRegx, "") // Remove completed items in main text
			.trimStart()
			.trimEnd();
		return this.isCompletedAreaExisted(content)
			? newContent.replace(header, `${header}${completedArea}`)
			: newContent + completedArea;
	}

	formatItems(items: Array<string>, content: string): string {
		let completedArea = "";
		const header = this.makeCompletedHeader(content);
		items[0] = (items[0][0] === "\n" ? "" : "\n") + items[0];

		completedArea = items.reduce((prev, current) => {
			return prev + current;
		}, header);

		return completedArea;
	}

	makeCompletedHeader(content: string): string {
		this.completedAreaHeader =
			"\n" +
			"#".repeat(Number(this.setting.completedAreaHierarchy)) +
			` ${this.setting.completedAreaName}`;

		return this.isCompletedAreaExisted(content)
			? "" // if completed header already exists
			: this.completedAreaHeader;
	}

	isCompletedAreaExisted(content: string): boolean {
		return !!content.match(RegExp(this.completedAreaHeader));
	}
}
