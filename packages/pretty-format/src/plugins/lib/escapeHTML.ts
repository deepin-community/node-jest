/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function escapeHTML(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
