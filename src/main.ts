import CompletedAreaSettingTab from "./CompletedAreaSettingTab";
import CompletedAreaSetting from "./CompletedAreaSetting";
import { Plugin, Notice, addIcon } from "obsidian";

addIcon(
	"completed-area",
	'<g id="icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><rect id="Rectangle" stroke="currentColor" stroke-width="8" x="20" y="20" width="60" height="60" rx="10"></rect><path d="M68.7153857,33.5033079 L72.0903697,35.8858648 C72.5415551,36.2043773 72.6491076,36.8283407 72.3305951,37.2795261 L72.2641586,37.3636708 L48.720426,64.1010398 C46.5305195,66.5880005 42.7391695,66.8288105 40.2522088,64.638904 C40.1258491,64.5276373 40.0042287,64.4111011 39.8876706,64.2896051 L28.6056533,52.5296259 C28.258873,52.1681543 28.2330404,51.6058741 28.5452158,51.2141283 L31.9837559,46.899139 C32.3279438,46.467221 32.9571019,46.3961018 33.3890199,46.7402897 C33.4274056,46.7708786 33.4634871,46.8042521 33.4969719,46.8401396 L42.8381754,56.8516325 C43.5917202,57.6592488 44.8572913,57.7030825 45.6649076,56.9495377 L45.7632746,56.8511374 L67.4072774,33.6382921 C67.7482521,33.2726022 68.3069198,33.2149531 68.7153857,33.5033079 Z" id="Path" fill="currentColor" fill-rule="nonzero"></path></g>'
);

export default class CompletedAreaPlugin extends Plugin {
	public setting: CompletedAreaSetting;
	public completedItemRegx: RegExp = /(\n?- \[x\] .*)/g;
	public completedAreaHeader: string;

	async onload() {
		this.setting = new CompletedAreaSetting();
		await this.loadSetting();

		if (this.setting.showIcon) {
			this.addRibbonIcon("completed-area", "Completed Area", () => {
				this.processCompletedItems();
			});
		}

		this.addCommand({
			id: "completed-area-shortcut",
			name: "Extracted completed items.",
			hotkeys: [{ modifiers: ["Ctrl"], key: "Enter" }],
			callback: () => this.processCompletedItems(),
		});

		this.addSettingTab(new CompletedAreaSettingTab(this.app, this));
	}

	async processCompletedItems() {
		const activeLeaf = this.app.workspace.activeLeaf ?? null;
		if (activeLeaf) {
			const source = activeLeaf.view.sourceMode;
			const sourceContent = source.get();
			const completedItems = this.extractCompletedItems(sourceContent) ?? null;
			if (completedItems) {
				const newContent = this.refactorContent(sourceContent, completedItems);
				source.set(newContent, false);
			}
		} else {
			new Notice("Please active a leaf first.");
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
