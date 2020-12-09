import {
	App,
	PluginSettingTab,
	Setting,
	Notice,
	DropdownComponent,
} from "obsidian";
import CompletedAreaPlugin from "./main";

export default class CompletedAreaSettingTab extends PluginSettingTab {
	private readonly plugin: CompletedAreaPlugin;
	public defaultHeaderLevel = "2";
	public defaultHeaderName = "Completed";
	public defaultThirdHotkey = "Enter";

	constructor(app: App, plugin: CompletedAreaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Header level")
			.setDesc("number of `#`s in the header.")
			.addText((text) =>
				text
					.setPlaceholder(this.defaultHeaderLevel)
					.setValue(this.plugin.setting.completedAreaHierarchy)
					.onChange((value) => {
						if (this.isHierarchyValid(value)) {
							this.plugin.setting.completedAreaHierarchy =
								value || this.defaultHeaderLevel;
							this.plugin.saveData(this.plugin.setting).then(() => {
								text.setValue(value);
							});
						} else {
							new Notice("Header level's number not valid!");
						}
					})
			);

		new Setting(containerEl)
			.setName("Header name")
			.setDesc("where the completed items be extracted to.")
			.addText((text) =>
				text
					.setPlaceholder(this.defaultHeaderName)
					.setValue(this.plugin.setting.completedAreaName)
					.onChange((value) => {
						this.plugin.setting.completedAreaName =
							value || this.defaultHeaderName;
						this.plugin.saveData(this.plugin.setting);
						text.setValue(value);
					})
			);

		new Setting(containerEl)
			.setName("Show icon on left sidebar")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.setting.showIcon).onChange((value) => {
					this.plugin.setting.showIcon = value;
					this.plugin.saveData(this.plugin.setting);
					new Notice(
						`Reload the app to see icon ${value ? "added" : "removed"}.`
					);
				});
			});

		new Setting(containerEl)
			.setName("Toggle to-do shortcut")
			.setDesc("should be same as the todo shortcut")
			.addDropdown((dropdown) => {
				dropdown
					.addOptions(
						navigator.platform.match(/Mac/)
							? {
									Empty: " ",
									Control: "⌃",
									Alt: "⌥",
									Shift: "Shift",
									Meta: "⌘",
							  }
							: { Control: "Ctrl", Alt: "Alt", Meta: "Meta", Shift: "Shift" }
					)
					.setValue(this.plugin.setting.hotkey.first)
					.onChange((value) => {
						this.plugin.setting.hotkey.first = value;
						this.plugin.saveData(this.plugin.setting).then(() => {
							dropdown.setValue(value);
						});
					});
			})
			.addDropdown((dropdown) => {
				dropdown
					.addOptions(
						navigator.platform.match(/Mac/)
							? {
									Control: "⌃",
									Alt: "⌥",
									Meta: "⌘",
									Shift: "Shift",
									Empty: " ",
							  }
							: { Control: "Ctrl", Alt: "Alt", Meta: "Meta", Shift: "Shift" }
					)
					.setValue(this.plugin.setting.hotkey.second)
					.onChange((value) => {
						this.plugin.setting.hotkey.second = value;
						this.plugin.saveData(this.plugin.setting).then(() => {
							dropdown.setValue(value);
						});
					});
			})
			.addText((text) =>
				text
					.setPlaceholder(this.defaultThirdHotkey)
					.setValue(this.plugin.setting.hotkey.third)
					.onChange((value) => {
						if (this.isThirdHotkeyValid(value)) {
							this.plugin.setting.hotkey.third =
								value || this.defaultThirdHotkey;
							this.plugin.saveData(this.plugin.setting).then(() => {
								text.setValue(value);
							});
						} else {
							text.setValue("");
							new Notice("The third hotkey should be a character.");
						}
					})
			);
	}

	isHierarchyValid(hierarchyLevel: string): boolean {
		const validLevels = [1, 2, 3, 4, 5, 6];
		for (let validNum of validLevels) {
			if (Number(hierarchyLevel) === validNum || hierarchyLevel === "") {
				return true;
			}
		}
		return false;
	}

	isThirdHotkeyValid(hotkey: string): boolean {
		return hotkey.length === 1 || hotkey.length === 0;
	}
}
