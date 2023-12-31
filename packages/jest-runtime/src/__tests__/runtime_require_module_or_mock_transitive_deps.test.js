/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

let createRuntime;

const moduleNameMapper = {
  '^[./a-zA-Z0-9$_-]+.png$': 'RelativeImageStub',
  '^image![a-zA-Z0-9$_-]+$': 'global_image_stub',
  '^testMapped/(.*)': '<rootDir>/mapped_dir/$1',
  mappedToDirectory: '<rootDir>/MyDirectoryModule',
  mappedToPath: '<rootDir>/global_image_stub.js',
  'module/name/(.*)': '<rootDir>/mapped_module_$1.js',
};

beforeEach(() => {
  jest.resetModules();

  createRuntime = require('createRuntime');
});

describe('transitive dependencies', () => {
  const expectUnmocked = nodeModule => {
    const moduleData = nodeModule();
    expect(moduleData.isUnmocked()).toBe(true);
    expect(moduleData.transitiveNPM3Dep).toBe('npm3-transitive-dep');
    expect(moduleData.internalImplementation()).toBe('internal-module-code');
  };

  it('mocks a manually mocked and mapped module', async () => {
    const runtime = await createRuntime(__filename, {
      automock: false,
      moduleNameMapper,
    });
    runtime.setMock(
      __filename,
      './test_root/mapped_dir/moduleInMapped',
      () => 'mocked_in_mapped',
    );

    const parentDep = runtime.requireModule(
      runtime.__mockRootPath,
      './dep_on_mapped_module.js',
    );
    expect(parentDep).toEqual({result: 'mocked_in_mapped'});
  });

  it('unmocks transitive dependencies in node_modules by default', async () => {
    const runtime = await createRuntime(__filename, {
      automock: true,
      moduleNameMapper,
      unmockedModulePathPatterns: ['npm3-main-dep'],
    });
    const root = runtime.requireModule(runtime.__mockRootPath, './root.js');
    expectUnmocked(
      runtime.requireModuleOrMock(runtime.__mockRootPath, 'npm3-main-dep'),
    );

    // Test twice to make sure Runtime caching works properly
    root.jest.resetModules();
    expectUnmocked(
      runtime.requireModuleOrMock(runtime.__mockRootPath, 'npm3-main-dep'),
    );

    // Directly requiring the transitive dependency will mock it
    const transitiveDep = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'npm3-transitive-dep',
    );
    expect(transitiveDep()).toBeUndefined();
  });

  it('unmocks transitive dependencies in node_modules when using unmock', async () => {
    const runtime = await createRuntime(__filename, {
      automock: true,
      moduleNameMapper,
    });
    const root = runtime.requireModule(runtime.__mockRootPath);
    root.jest.unmock('npm3-main-dep');
    expectUnmocked(
      runtime.requireModuleOrMock(runtime.__mockRootPath, 'npm3-main-dep'),
    );

    // Test twice to make sure Runtime caching works properly
    root.jest.resetModules();
    expectUnmocked(
      runtime.requireModuleOrMock(runtime.__mockRootPath, 'npm3-main-dep'),
    );

    // Directly requiring the transitive dependency will mock it
    const transitiveDep = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'npm3-transitive-dep',
    );
    expect(transitiveDep()).toBeUndefined();
  });

  it('unmocks transitive dependencies in node_modules by default when using both patterns and unmock', async () => {
    const runtime = await createRuntime(__filename, {
      automock: true,
      moduleNameMapper,
      unmockedModulePathPatterns: ['banana-module'],
    });
    const root = runtime.requireModule(runtime.__mockRootPath);
    root.jest.unmock('npm3-main-dep');
    expectUnmocked(
      runtime.requireModuleOrMock(runtime.__mockRootPath, 'npm3-main-dep'),
    );

    // Test twice to make sure Runtime caching works properly
    root.jest.resetModules();
    expectUnmocked(
      runtime.requireModuleOrMock(runtime.__mockRootPath, 'npm3-main-dep'),
    );

    // Directly requiring the transitive dependency will mock it
    const transitiveDep = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'npm3-transitive-dep',
    );
    expect(transitiveDep()).toBeUndefined();
  });

  it('mocks deep dependencies when using unmock', async () => {
    const runtime = await createRuntime(__filename, {
      automock: true,
      moduleNameMapper,
    });
    const root = runtime.requireModule(runtime.__mockRootPath, './root.js');
    root.jest.unmock('FooContainer.react');

    const FooContainer = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'FooContainer.react',
    );

    expect(new FooContainer().render().indexOf('5')).toBe(-1);
  });

  it('does not mock deep dependencies when using deepUnmock', async () => {
    const runtime = await createRuntime(__filename, {moduleNameMapper});
    const root = runtime.requireModule(runtime.__mockRootPath, './root.js');
    root.jest.deepUnmock('FooContainer.react');

    const FooContainer = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'FooContainer.react',
    );

    expect(new FooContainer().render().indexOf('5')).not.toBe(-1);
  });
});
