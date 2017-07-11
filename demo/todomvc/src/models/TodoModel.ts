export class TodoModel {
  id: string;
  title: string;
  completed: boolean;

  constructor(id: string, title: string, completed: boolean) {
    this.id = id;
    this.title = title;
    this.completed = completed;
  }

  toggle() {
    this.completed = !this.completed;
  }

  // tslint:disable-next-line:no-empty
  destroy() {
  }

  setTitle(title: string) {
    this.title = title;
  }
}
