export default class FootLinksSetting {
	public completedAreaHierarchy: string;
	public completedAreaName: string;
	public todoAreaName: string;
	public showIcon: boolean;
	public sortedBy: string;

	constructor() {
		this.completedAreaHierarchy = "3";
		this.completedAreaName = "Completed";
		this.todoAreaName = "Todo";
		this.showIcon = true;
		this.sortedBy = "Asc";
	}
}
