/*
 * Copyright (C) 2020 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 *
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

/*
 ** Copied from canvas-lms/ui/shared/react/components/__test__/CanvasSelect.test.js
 */

import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import '@instructure/canvas-theme'
import CanvasSelect from '../shared/CanvasSelect'
import {vi} from 'vitest'

function selectProps(override = {}) {
  return {
    id: 'sel1',
    label: 'Choose one',
    value: undefined,
    onChange: () => {},
    translatedStrings: {
      USE_ARROWS: 'Use arrow keys to navigate options.',
      LIST_COLLAPSED: 'List collapsed.',
      LIST_EXPANDED: 'List expanded.',
      OPTION_SELECTED: '{option} selected.',
    },
    liveRegion: () => liveRegion,
    ...override,
  }
}

function selectOpts() {
  return [
    <CanvasSelect.Option key="1" id="1" value="one">
      One
    </CanvasSelect.Option>,
    <CanvasSelect.Option key="2" id="2" value="two">
      Two
    </CanvasSelect.Option>,
    <CanvasSelect.Option key="3" id="3" value="three">
      Three
    </CanvasSelect.Option>,
  ]
}

function renderSelect(otherProps) {
  return render(<CanvasSelect {...selectProps(otherProps)}>{selectOpts()}</CanvasSelect>)
}

let liveRegion = null
beforeAll(() => {
  if (!document.getElementById('flash_screenreader_holder')) {
    liveRegion = document.createElement('div')
    liveRegion.id = 'flash_screenreader_holder'
    liveRegion.setAttribute('role', 'alert')
    document.body.appendChild(liveRegion)
  }
})

afterAll(() => {
  if (liveRegion) {
    liveRegion.remove()
  }
})

describe('CanvasSelect component', () => {
  it('renders', () => {
    const {getByText} = renderSelect()
    expect(getByText('Choose one')).toBeInTheDocument()
  })

  it('shows the selected option', () => {
    const {getByDisplayValue} = renderSelect({value: 'two'})
    expect(getByDisplayValue('Two')).toBeInTheDocument()
  })

  it('calls onChange when selection changes', async () => {
    const handleChange = vi.fn()
    const {getByText} = renderSelect({onChange: handleChange})

    const label = getByText('Choose one')
    await fireEvent.click(label)

    // the options list is open now
    const three = getByText('Three')
    await fireEvent.click(three)

    expect(handleChange).toHaveBeenCalled()
  })

  it('forwards the isDisabled prop', async () => {
    const handleChange = vi.fn()
    const {getByText} = render(
      <CanvasSelect {...selectProps({onChange: handleChange})}>
        <CanvasSelect.Option key="1" id="1" value="one">
          One
        </CanvasSelect.Option>
        <CanvasSelect.Option key="2" id="2" value="two">
          Two
        </CanvasSelect.Option>
        <CanvasSelect.Option key="3" id="3" value="three" isDisabled={true}>
          Three
        </CanvasSelect.Option>
      </CanvasSelect>,
    )

    const label = getByText('Choose one')
    await fireEvent.click(label)

    const three = getByText('Three')
    await fireEvent.click(three)

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('filters out undefined options', async () => {
    const {getByText} = render(
      <CanvasSelect {...selectProps()}>
        <CanvasSelect.Option key="1" id="1" value="one">
          One
        </CanvasSelect.Option>
        undefined
        <CanvasSelect.Option key="3" id="3" value="three" isDisabled={true}>
          Three
        </CanvasSelect.Option>
      </CanvasSelect>,
    )
    const label = getByText('Choose one')
    await fireEvent.click(label)

    expect(getByText('One')).toBeInTheDocument()
    expect(getByText('Three')).toBeInTheDocument()
  })

  it('handles no children', async () => {
    const {getByText} = render(<CanvasSelect {...selectProps({noOptionsLabel: 'No Options'})} />)
    const label = getByText('Choose one')
    await fireEvent.click(label)

    expect(getByText('No Options')).toBeInTheDocument()
  })

  it('handles no options', async () => {
    const {getByText} = render(
      <CanvasSelect {...selectProps({noOptionsLabel: 'No Options'})}>what is this?</CanvasSelect>,
    )
    const label = getByText('Choose one')
    await fireEvent.click(label)

    expect(getByText('No Options')).toBeInTheDocument()
  })

  describe('CanvasSelectGroups', () => {
    it('renders enumerated groups and options', async () => {
      const {getByText} = render(
        <CanvasSelect {...selectProps()}>
          <CanvasSelect.Group id="1" label="Group A">
            <CanvasSelect.Option id="1" value="one">
              One
            </CanvasSelect.Option>
            <CanvasSelect.Option id="2" value="two">
              Two
            </CanvasSelect.Option>
            <CanvasSelect.Option id="3" value="three">
              Three
            </CanvasSelect.Option>
          </CanvasSelect.Group>
          <CanvasSelect.Group id="2" label="Group B">
            <CanvasSelect.Option id="4" value="four">
              Four
            </CanvasSelect.Option>
            <CanvasSelect.Option id="5" value="five">
              Five
            </CanvasSelect.Option>
            <CanvasSelect.Option id="6" value="siz">
              Six
            </CanvasSelect.Option>
          </CanvasSelect.Group>
        </CanvasSelect>,
      )
      expect(getByText('Choose one')).toBeInTheDocument()
      const label = getByText('Choose one')
      await fireEvent.click(label)

      expect(getByText('Group A')).toBeInTheDocument()
      expect(getByText('One')).toBeInTheDocument()
      expect(getByText('Group B')).toBeInTheDocument()
      expect(getByText('Four')).toBeInTheDocument()
    })

    it('renders group with one option', async () => {
      const {getByText} = render(
        <CanvasSelect {...selectProps()}>
          <CanvasSelect.Group id="1" label="Group A">
            <CanvasSelect.Option id="1" value="one">
              One
            </CanvasSelect.Option>
          </CanvasSelect.Group>
        </CanvasSelect>,
      )
      expect(getByText('Choose one')).toBeInTheDocument()
      const label = getByText('Choose one')
      await fireEvent.click(label)

      expect(getByText('Group A')).toBeInTheDocument()
      expect(getByText('One')).toBeInTheDocument()
    })
  })

  it('renders generated groups and options', async () => {
    const data = [
      {
        label: 'Group A',
        items: [
          {id: '1', value: 'one', label: 'One'},
          {id: '2', value: 'two', label: 'Two'},
          {id: '3', value: 'three', label: 'Three'},
        ],
      },
      {
        label: 'Group B',
        items: [
          {id: '4', value: 'four', label: 'Four'},
          {id: '5', value: 'five', label: 'Five'},
          {id: '6', value: 'siz', label: 'Six'},
        ],
      },
    ]

    let k = 0
    const {getByText} = render(
      <CanvasSelect {...selectProps()}>
        <CanvasSelect.Option id="0" value="0">
          Zero
        </CanvasSelect.Option>
        {data.map(grp => (
          <CanvasSelect.Group key={`${++k}`} label={grp.label}>
            {grp.items.map(opt => (
              <CanvasSelect.Option key={`${++k}`} id={opt.id} value={opt.value}>
                {opt.label}
              </CanvasSelect.Option>
            ))}
          </CanvasSelect.Group>
        ))}
      </CanvasSelect>,
    )

    expect(getByText('Choose one')).toBeInTheDocument()
    const label = getByText('Choose one')
    await fireEvent.click(label)

    expect(getByText('Group A')).toBeInTheDocument()
    expect(getByText('One')).toBeInTheDocument()
    expect(getByText('Group B')).toBeInTheDocument()
    expect(getByText('Four')).toBeInTheDocument()
  })
})
