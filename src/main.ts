import CompletedAreaSettingTab from "./CompletedAreaSettingTab";
import CompletedAreaSetting from "./CompletedAreaSetting";
import { Plugin, Notice } from "obsidian";

export default class CompletedAreaPlugin extends Plugin {
	public setting: CompletedAreaSetting;
	public completedItemRegx: RegExp = /(\n?- \[x\] .*)/g;
	public keyPressed = {};
	public completedAreaHeader: string;

	async onload() {
		this.setting = new CompletedAreaSetting();
		await this.loadSetting();

		if (this.setting.showIcon) {
			this.addRibbonIcon("dice", "Completed Area", () => {
				this.processCompletedItems();
			});
		}

		// this.registerEvent(
		// 	this.app.on("codemirror", (cm: CodeMirror.Editor) => {
		// 		cm.on("keydown", this.handleKeyDown);
		// 		cm.on("keyup", this.handleKeyUp);
		// 	})
		// );

		this.addCommand({
			id: "completed-area-shortcut",
			name: "Extracted completed items.",
			callback: () => this.processCompletedItems(),
		});

		this.addSettingTab(new CompletedAreaSettingTab(this.app, this));
	}

	// handleKeyDown = (cm: CodeMirror.Editor, event: KeyboardEvent): void => {
	// 	this.keyPressed[event.key] = true;
	// 	if (this.keyPressed["Meta"] && event.key == "t") {
	// 		this.processCompletedItems();
	// 	}
	// };

	// handleKeyUp = (cm: CodeMirror.Editor, event: KeyboardEvent): void => {
	// 	delete this.keyPressed[event.key];
	// };

	async processCompletedItems() {
		const activeLeaf = this.app.workspace.activeLeaf ?? null;
		const source = activeLeaf.view.sourceMode;
		const sourceContent = source.get();
		const completedItems = this.extractCompletedItems(sourceContent) ?? null;
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
		} else {
			this.saveData(this.setting);
		}
	}

	extractCompletedItems(text: string): Array<string> | void {
		let completedItems: Array<string> = [];

		if (text) {
			completedItems = text.match(this.completedItemRegx);

			if (!completedItems) {
				new Notice("No completed todos found.");
				return;
			}

			return completedItems;
		} else {
			new Notice("This is an empty note.");
		}
	}

	refactorContent(content: string, items: Array<string>): string {
		const completedArea = this.formatItems(items, content);
		const header = this.completedAreaHeader.trimStart();
		let newContent = content
			.replace(this.completedItemRegx, "") // Remove completed items in main text
			.trimStart()
			.trimEnd();
		console.table([newContent, header, completedArea]);
		return this.isCompletedAreaExisted(content)
			? newContent.replace(header, `${header}${completedArea}`)
			: newContent + completedArea;
	}

	formatItems(items: Array<string>, content: string): string {
		let completedArea = "";
		const header = this.makeCompletedHeader(content);
		completedArea = items.reduce((prev, current) => {
			return prev + current;
		}, header);
		return (completedArea[0] === "\n" ? "" : "\n") + completedArea;
	}

	makeCompletedHeader(content: string): string {
		this.completedAreaHeader =
			"\n\n" +
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
