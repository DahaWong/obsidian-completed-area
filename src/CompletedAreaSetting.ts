export default class CompletedAreaSetting {
	public completedAreaHierarchy: string;
	public completedAreaName: string;
	public todoAreaName: string;
	public showIcon: boolean;
	public sortedBy: string;
	public hotkey: { first: string; second: string; third: string };

	constructor() {
		this.completedAreaHierarchy = "2";
		this.completedAreaName = "Completed";
		this.todoAreaName = "Todo";
		this.showIcon = true;
		this.sortedBy = "Asc";
		this.hotkey = { first: "Empty", second: "Control", third: "Enter" };
	}
}
