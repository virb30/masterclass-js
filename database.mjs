import { Parser } from "./parser.mjs";
import { DatabaseError } from "./database-error.mjs";

export class Database {
  constructor() {
    this.tables = {};
    this.parser = new Parser();
  }

  createTable(parsedStatement) {
    let [, tableName, columns] = parsedStatement;
    this.tables[tableName] = {
      columns: {},
      data: []
    };
    columns = columns.split(',');
    for (let column of columns) {
      column = column.trim().split(' ');
      const [name, type] = column;
      this.tables[tableName].columns[name] = type;
    }
  }

  insert(parsedStatement) {
    let [, tableName, columns, values] = parsedStatement;
    columns = columns.split(',').map(column => column.trim());
    values = values.split(',').map(value => value.trim());
    let row = {};
    for (let index in columns) {
      row[columns[index]] = values[index];
    }
    this.tables[tableName].data.push(row);
  }

  select(parsedStatement) {
    let [, columns, tableName, whereClause] = parsedStatement;
    columns = columns.split(',').map(column => column.trim());
    let rows = this.tables[tableName].data;
    if (whereClause) {
      const [columnWhere, valueWhere] = whereClause.split(" = ");
      rows = rows.filter((row) => {
        return row[columnWhere] === valueWhere;
      });
    }
    rows = rows.map((row) => {
      let selectedRow = {};
      columns.forEach((column) => {
        selectedRow[column] = row[column];
      });
      return selectedRow;
    });
    return rows;
  }

  delete(parsedStatement) {
    const [, tableName, whereClause] = parsedStatement;
    if (whereClause) {
      const [columnWhere, valueWhere] = whereClause.split(" = ");
      this.tables[tableName].data = this.tables[tableName].data.filter((row) => {
        return row[columnWhere] !== valueWhere
      });
    } else {
      this.tables[tableName].data = [];
    }
  }

  execute(statement) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const parsed = this.parser.parse(statement);
        if (!parsed) {
          return reject(new DatabaseError(statement, 'Syntax error'));
        }
        const { command, parsedStatement } = parsed;
        return resolve(this[command](parsedStatement));
      }, 1000);
    });
  }
}
