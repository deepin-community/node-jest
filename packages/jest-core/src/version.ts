/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Cannot be `import` as it's not under TS root dir
const {version: VERSION} = require('../package.json');

export default function getVersion(): string {
  return VERSION;
}
