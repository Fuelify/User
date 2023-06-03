
import { createContainer, asClass, AwilixContainer, } from 'awilix';
const container: AwilixContainer = createContainer();

function setup(): void {
  container.loadModules([
    './src/middleware/**/*.ts',
    './src/models/**/*.ts',
    './src/modules/**/*.ts',
    './src/services/**/*.ts',
    './src/controllers/**/*.ts',
    './src/repositories/**/*.ts',
    './src/errors/**/*.ts'
  ], {
    formatName: 'camelCase',
    resolverOptions: { 
      register: asClass,
    }
  });

}

export { container, setup };