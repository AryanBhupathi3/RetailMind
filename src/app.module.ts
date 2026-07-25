import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { HealthModule } from './health/health.module';
import { PlannerModule } from './planner/planner.module';
import { SystemHealthCheck } from './health/system.health';

/**
 * Root Application Module
 * 
 * This is the main module that bootstraps the MCP server for RetailMind AI.
 */
@McpApp({
  module: AppModule,
  server: {
    name: 'retailmind-ai-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'RetailMindApp',
  description: 'Root application module for RetailMind AI Planner',
  imports: [
    ConfigModule.forRoot(),
    HealthModule,
    PlannerModule
  ],
  providers: [
    // Health Checks
    SystemHealthCheck,
  ]
})
export class AppModule {} 