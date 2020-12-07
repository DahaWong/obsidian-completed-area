import CompletedAreaSettingTab from "./CompletedAreaSettingTab";
import CompletedAreaSetting from "./CompletedAreaSetting";
import { Plugin, Notice, addIcon } from "obsidian";

export default class CompletedAreaPlugin extends Plugin {
	public setting: CompletedAreaSetting;
	public completedItemRegx: RegExp = /(\n?- \[x\] .*)/g;
	public completedHeaderRegx: RegExp;
	public completedAreaHeader: string;

	async onload() {
		this.setting = new CompletedAreaSetting();
		await this.loadSetting();

		this.completedAreaHeader =
			"\n\n" +
			"#".repeat(Number(this.setting.completedAreaHierarchy)) +
			` ${this.setting.completedAreaName}`;

		this.completedHeaderRegx = new RegExp(this.completedAreaHeader);

		if (this.setting.showIcon) {
			this.addRibbonIcon("dice", "Footlinks", () => {
				this.processCompletedItems();
			});
		}

		this.addCommand({
			id: "completed-area-shortcut",
			name: "Extracted completed items.",
			callback: () => this.processCompletedItems(),
		});

		this.addSettingTab(new CompletedAreaSettingTab(this.app, this));
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

	async processCompletedItems() {
		await this.loadSetting();
		const activeLeaf = this.app.workspace.activeLeaf ?? null;
		const source = activeLeaf.view.sourceMode;
		const sourceContent = source.get();
		const completedItems = this.extractCompletedItems(sourceContent) ?? null;
		if (completedItems) {
			const newContent = this.refactorContent(sourceContent, completedItems);
			source.set(newContent, false);
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
		let newContent = content
			.replace(this.completedItemRegx, "") // Remove completed items in main text
			.trimStart()
			.trimEnd();
		newContent += completedArea;
		return newContent;
	}

	formatItems(items: Array<string>, content: string): string {
		let completedArea = "";
		const header = this.makeCompletedHeader(content);
		completedArea = items.reduce((prev, current) => {
			return prev + current;
		}, header);
		return completedArea;
	}

	makeCompletedHeader(content: string): string {
		return !!content.match(this.completedHeaderRegx)
			? "\n" // if completed header already exists
			: this.completedAreaHeader;
	}
}
