import 'reflect-metadata';
import {startServer} from "@utils/startup.helper";

if (require.main === module) {
    startServer();
}