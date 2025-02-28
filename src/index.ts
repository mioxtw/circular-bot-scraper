import { Server } from './server';
import { TaskManager } from './services/TaskManager';
import { config } from './config/config';
import { validateConfig } from './utils/configValidator';
import { logger } from './utils/logger';

async function bootstrap() {
    try {
        // 验证配置
        validateConfig(config);

        // 启动服务器
        const server = Server.getInstance();
        server.start();

        // 启动任务管理器
        const taskManager = TaskManager.getInstance();
        taskManager.startScheduler();

        logger.info('应用程序已成功启动');
    } catch (error) {
        logger.error('应用程序启动失败：', error);
        process.exit(1);
    }
}

// 启动应用
bootstrap(); 