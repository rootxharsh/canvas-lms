/*
 * Copyright (C) 2024 - present Instructure, Inc.
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

import {act, render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import {MemoryRouter, Routes} from 'react-router-dom'
import {useNewLoginData} from '../../context'
import {NewLoginRoutes} from '../NewLoginRoutes'

jest.mock('../../assets/images/instructure.svg', () => 'instructure.svg')
jest.mock('../../pages/SignIn', () => () => <div>Sign In Page</div>)
jest.mock('../../pages/ForgotPassword', () => () => <div>Forgot Password Page</div>)
jest.mock('../../pages/register/Landing', () => () => <div>Register Landing Page</div>)
jest.mock('../../pages/register/Student', () => () => <div>Register Student Page</div>)
jest.mock('../../pages/register/Parent', () => () => <div>Register Parent Page</div>)
jest.mock('../../pages/register/Teacher', () => () => <div>Register Teacher Page</div>)
jest.mock('@instructure/ui-img', () => {
  const Img = ({src, alt}: {src: string; alt: string}) => <img src={src} alt={alt} />
  return {Img}
})
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    ScrollRestoration: () => null,
  }
})
jest.mock('../../context/NewLoginDataContext', () => ({
  ...jest.requireActual('../../context/NewLoginDataContext'),
  useNewLoginData: jest.fn(),
}))

const mockUseNewLoginData = useNewLoginData as jest.Mock

describe('NewLoginRoutes', () => {
  beforeEach(() => {
    const marker = document.createElement('div')
    marker.setAttribute('id', 'new_login_safe_to_mount')
    document.body.appendChild(marker)

    mockUseNewLoginData.mockReturnValue({
      selfRegistrationType: 'all',
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    document.getElementById('new_login_safe_to_mount')?.remove()
  })

  it('renders SignIn component at /login/canvas', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login/canvas']}>
          <Routes>{NewLoginRoutes}</Routes>
        </MemoryRouter>,
      )
    })
    await waitFor(() => expect(screen.getByText('Sign In Page')).toBeInTheDocument())
  })

  it('renders SignIn component at /login/ldap', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login/ldap']}>
          <Routes>{NewLoginRoutes}</Routes>
        </MemoryRouter>,
      )
    })
    await waitFor(() => expect(screen.getByText('Sign In Page')).toBeInTheDocument())
  })

  it('renders ForgotPassword component at /login/canvas/forgot-password', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login/canvas/forgot-password']}>
          <Routes>{NewLoginRoutes}</Routes>
        </MemoryRouter>,
      )
    })
    await waitFor(() => expect(screen.getByText('Forgot Password Page')).toBeInTheDocument())
  })

  describe('registration routes', () => {
    it('renders Register Landing Page at /login/canvas/register', async () => {
      await act(async () => {
        render(
          <MemoryRouter initialEntries={['/login/canvas/register']}>
            <Routes>{NewLoginRoutes}</Routes>
          </MemoryRouter>,
        )
      })
      await waitFor(() => expect(screen.getByText('Register Landing Page')).toBeInTheDocument())
    })

    it('renders Register Student Page at /login/canvas/register/student', async () => {
      await act(async () => {
        render(
          <MemoryRouter initialEntries={['/login/canvas/register/student']}>
            <Routes>{NewLoginRoutes}</Routes>
          </MemoryRouter>,
        )
      })
      await waitFor(() => expect(screen.getByText('Register Student Page')).toBeInTheDocument())
    })

    it('renders Register Parent Page at /login/canvas/register/parent', async () => {
      await act(async () => {
        render(
          <MemoryRouter initialEntries={['/login/canvas/register/parent']}>
            <Routes>{NewLoginRoutes}</Routes>
          </MemoryRouter>,
        )
      })
      await waitFor(() => expect(screen.getByText('Register Parent Page')).toBeInTheDocument())
    })

    it('renders Register Teacher Page at /login/canvas/register/teacher', async () => {
      await act(async () => {
        render(
          <MemoryRouter initialEntries={['/login/canvas/register/teacher']}>
            <Routes>{NewLoginRoutes}</Routes>
          </MemoryRouter>,
        )
      })
      await waitFor(() => expect(screen.getByText('Register Teacher Page')).toBeInTheDocument())
    })
  })
})
