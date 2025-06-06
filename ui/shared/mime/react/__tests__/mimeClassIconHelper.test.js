/*
 * Copyright (C) 2019 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {getIconByType, DEFAULT_ICON, ICON_TYPES, ICON_TITLES} from '../mimeClassIconHelper'

describe('GetIconByType', () => {
  Object.entries(ICON_TYPES).forEach(([type, icon]) => {
    it(`returns the correct icon when the '${type}' mime class is specified`, () => {
      expect(getIconByType(type)).toBe(icon)
    })
  })

  it('returns the default icon when a mime class cannot be found', () => {
    expect(getIconByType('fakeclass')).toBe(DEFAULT_ICON)
  })

  it.each(Object.entries(ICON_TITLES))(
    'returns the correct icon title for mime class "%s"',
    (mimeClass, expectedTitle) => {
      const icon = getIconByType(mimeClass)
      expect(icon.props.title).toBe(expectedTitle)
    },
  )

  it('returns the DEFAULT_ICON for an unknown mime class', () => {
    const icon = getIconByType('unknown_class')
    expect(icon.props.title).toBe(DEFAULT_ICON.props.title)
  })
})
