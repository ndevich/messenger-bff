import * as bunyan from "bunyan";

export default (name: string) => bunyan.createLogger({ name });
