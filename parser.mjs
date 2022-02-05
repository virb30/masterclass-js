export class Parser {
  constructor() {
    this.commands = new Map();
    this.commands.set("createTable", /^create table (\w+) \((.+)\)/);
    this.commands.set("insert", /^insert into (\w+) \((.+)\) values \((.+)\)/);
    this.commands.set("select", /^select (.+) from (\w+)(?: where (.+))?/);
    this.commands.set("delete", /delete from (\w+)(?: where (.+))?/);
  }

  parse(statement) {
    for (let [command, expression] of this.commands) {
      const parsedStatement = statement.match(expression);
      if (parsedStatement) {
        return {
          command,
          parsedStatement
        };
      }
    }
  }
}