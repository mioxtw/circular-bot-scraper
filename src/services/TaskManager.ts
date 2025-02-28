import cron from 'node-cron';
import axios from 'axios';
import { WebScraper } from './scraper';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export class TaskManager {
    private static instance: TaskManager;
    private webScraper: WebScraper;

    private constructor() {
        this.webScraper = WebScraper.getInstance();
    }

    public static getInstance(): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }

    /**
     * 执行网络爬虫任务
     */
    private async runScraperTask(): Promise<void> {
        try {
            const result = await this.webScraper.scrape();
            logger.info('网络爬虫任务完成', result);
        } catch (error) {
            logger.error('网络爬虫任务失败：', error);
            throw error;
        }
    }

    /**
     * 保存最新的 Mints 数据
     */
    private async saveLatestMints(): Promise<void> {
        try {
            const response = await axios.get(`http://localhost:${config.server.port}/api/analyze-latest-mintslist`, {
                params: { walletCount: 5 }
            });

            logger.info(`已保存最新的 Mints 数据，共 ${response.data.length} 个 Mint 地址`);
        } catch (error) {
            logger.error('保存最新 Mints 数据失败:', error);
            throw error;
        }
    }

    /**
     * 执行所有定时任务
     */
    private async runAllTasks(): Promise<void> {
        try {
            logger.info('开始执行定时任务...');
            await this.runScraperTask();
            await this.saveLatestMints();
            logger.info('所有定时任务执行完成');
        } catch (error) {
            logger.error('定时任务执行失败:', error);
        }
    }

    /**
     * 启动定时任务调度
     */
    public startScheduler(): void {
        // 设置定时任务
        cron.schedule(config.scraper.interval, () => this.runAllTasks());
        logger.info('定时任务调度器已启动');

        // 立即执行一次
        this.runAllTasks();
    }
} 