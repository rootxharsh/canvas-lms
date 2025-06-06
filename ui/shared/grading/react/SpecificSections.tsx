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

import React from 'react'
import {Checkbox} from '@instructure/ui-checkbox'
import {List} from '@instructure/ui-list'
import {Text} from '@instructure/ui-text'
import {View} from '@instructure/ui-view'
import {IconWarningSolid} from '@instructure/ui-icons'
import {useScope as createI18nScope} from '@canvas/i18n'

const {Item: ListItem} = List as any

const I18n = createI18nScope('hide_assignment_grades_tray')

type Props = {
  checked: boolean
  disabled: boolean
  onCheck: (checked: React.ChangeEvent<HTMLInputElement>) => void
  sections: Array<{id: string; name: string}>
  sectionSelectionChanged: (boolean: boolean, string: string) => void
  selectedSectionIds: string[]
  showSectionValidation?: boolean
}

export default function SpecificSections(props: Props) {
  const {
    checked,
    disabled,
    onCheck,
    sections,
    sectionSelectionChanged,
    selectedSectionIds,
    showSectionValidation,
  } = props

  return (
    <>
      <View as="div" margin="small 0 small" padding="0 medium">
        <Checkbox
          checked={checked}
          disabled={disabled}
          label={I18n.t('Specific Sections')}
          onChange={onCheck}
          size="small"
          variant="toggle"
        />
      </View>

      {showSectionValidation && (
        <View as="div" margin="small 0 small" padding="0 medium">
          <Text color="danger">
            <View textAlign="center">
              <View as="div" display="inline-block" margin="0 xxx-small xx-small 0">
                <IconWarningSolid />
              </View>
              {I18n.t('Please select at least one option')}
            </View>
          </Text>
        </View>
      )}

      {checked && !disabled && (
        <View
          as="div"
          margin="0 0 small"
          maxHeight="15rem"
          overflowX="hidden"
          overflowY="auto"
          padding="xxx-small 0 xxx-small large"
        >
          <List isUnstyled={true} margin="xxx-small 0" itemSpacing="small">
            {sections.map(section => (
              <ListItem key={section.id}>
                <Checkbox
                  checked={selectedSectionIds.includes(section.id)}
                  label={
                    <span
                      style={{
                        hyphens: 'auto',
                        msHyphens: 'auto',
                        overflowWrap: 'break-word',
                        WebkitHyphens: 'auto',
                      }}
                    >
                      {section.name}
                    </span>
                  }
                  onChange={event => {
                    sectionSelectionChanged(event.target.checked, section.id)
                  }}
                />
              </ListItem>
            ))}
          </List>
        </View>
      )}
    </>
  )
}
