import { Module } from '@nitrostack/core';
import { SystemHealthCheck } from './system.health';

@Module({
  name: 'health',
  description: 'System health and monitoring module',
  controllers: [SystemHealthCheck]
})
export class HealthModule {}
/* hi this is just for connecting all */
