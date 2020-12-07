import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import CompletedAreaPlugin from "./main";

export default class CompletedAreaSettingTab extends PluginSettingTab {
	private readonly plugin: CompletedAreaPlugin;

	constructor(app: App, plugin: CompletedAreaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Completed header level")
			.setDesc("the completed items header")
			.addText((text) =>
				text
					.setPlaceholder("3")
					.setValue(this.plugin.setting.completedAreaHierarchy)
					.onChange((value) => {
						if (this.isHierarchyValid(value)) {
							this.plugin.setting.completedAreaHierarchy = value;
							this.plugin.saveData(this.plugin.setting);
							text.setValue(value);
						}
					})
			);

		new Setting(containerEl)
			.setName("Completed Area Name")
			.setDesc("where completed items be extracted to.")
			.addText((text) =>
				text
					.setPlaceholder("Completed")
					.setValue(this.plugin.setting.completedAreaName)
					.onChange((value) => {
						this.plugin.setting.completedAreaName = value;
						this.plugin.saveData(this.plugin.setting);
						text.setValue(value);
					})
			);

		new Setting(containerEl)
			.setName("Show icon in left sidebar")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.setting.showIcon).onChange((value) => {
					this.plugin.setting.showIcon = value;
					this.plugin.saveData(this.plugin.setting);
					new Notice(
						`Reload the app to see icon ${value ? "added" : "removed"}.`
					);
				});
			});

		// new Setting(containerEl)
		// 	.setName("Choose a footlinks style")
		// 	.addDropdown((dropdown) => {
		// 		dropdown.addOption("Single brackets", "test display");
		// 	});
	}

	isHierarchyValid(hierarchyLevel: string): boolean {
		const validLevels = [1, 2, 3, 4, 5, 6];
		for (let validNum of validLevels) {
			if (Number(hierarchyLevel) === validNum) {
				return true;
			}
		}
		return false;
	}
}
