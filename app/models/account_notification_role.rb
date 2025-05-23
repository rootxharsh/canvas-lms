# frozen_string_literal: true

#
# Copyright (C) 2011 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

class AccountNotificationRole < ActiveRecord::Base
  include Canvas::SoftDeletable

  belongs_to :account_notification
  belongs_to :role
  before_save :resolve_cross_account_role

  def resolve_cross_account_role
    if will_save_change_to_role_id? && role.root_account_id != account_notification.account.resolved_root_account_id
      self.role = role.role_for_root_account_id(account_notification.account.resolved_root_account_id)
    end
  end

  def role_name
    role_id ? role.name : "NilEnrollment"
  end
end
