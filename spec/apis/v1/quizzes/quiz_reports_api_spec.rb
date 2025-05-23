# frozen_string_literal: true

#
# Copyright (C) 2013 Instructure, Inc.
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

require_relative "../../api_spec_helper"
require_relative "../../../models/quizzes/quiz_statistics/item_analysis/common"

describe Quizzes::QuizReportsController, type: :request do
  describe "GET /courses/:course_id/quizzes/:quiz_id/reports [index]" do
    def api_index(params = {}, options = {})
      method = options[:raw] ? :raw_api_call : :api_call
      headers = options[:jsonapi] ? { "Accept" => "application/vnd.api+json" } : {}
      send method,
           :get,
           "/api/v1/courses/#{@course.id}/quizzes/#{@quiz.id}/reports",
           {
             controller: "quizzes/quiz_reports",
             action: "index",
             format: "json",
             course_id: @course.id.to_s,
             quiz_id: @quiz.id.to_s
           },
           params,
           headers
    end

    it "denies unprivileged access" do
      student_in_course(active_all: true)
      @quiz = @course.quizzes.create({ title: "Test Quiz" })
      api_index({}, { raw: true })
      assert_forbidden
    end

    context "with privileged access" do
      before(:once) do
        teacher_in_course(active_all: true)
        @quiz = @course.quizzes.create({ title: "Test Quiz" })
      end

      it "returns all reports, generated or not" do
        stats = @quiz.current_statistics_for "student_analysis"
        stats.save!

        json = api_index
        expect(json.length).to eq 2
        expect(json.pluck("report_type").sort)
          .to eq %w[item_analysis student_analysis]
      end

      context "flags" do
        def student_analysis(opts = {})
          json = api_index(opts)
          json.detect do |report|
            report["report_type"] == "student_analysis"
          end
        end

        describe "the `includes_all_versions` flag" do
          it "enables it" do
            expect(student_analysis(includes_all_versions: true)["includes_all_versions"]).to be true
          end

          it "defaults to false" do
            expect(student_analysis["includes_all_versions"]).to be false
          end
        end

        describe "includes_sis_ids" do
          it "includes sis ids for users with access" do
            expect(student_analysis["includes_sis_ids"]).to be true
          end

          it "does not include sis ids for users without access" do
            ta_in_course(active_all: true)
            expect(student_analysis["includes_sis_ids"]).to be false
          end
        end
      end

      context "JSON-API" do
        it "returns all reports, generated or not" do
          stats = @quiz.current_statistics_for "student_analysis"
          stats.save!

          json = api_index({}, { jsonapi: true })

          expect(json["quiz_reports"]).to be_present
          expect(json["quiz_reports"].length).to eq 2
          expect(json["quiz_reports"].pluck("report_type").sort)
            .to eq %w[item_analysis student_analysis]
        end
      end
    end
  end

  describe "POST /courses/:course_id/quizzes/:quiz_id/reports" do
    def api_create(params = {}, options = {})
      method = options[:raw] ? :raw_api_call : :api_call
      headers = options[:jsonapi] ? { "Accept" => "application/vnd.api+json" } : {}
      send method,
           :post,
           "/api/v1/courses/#{@course.id}/quizzes/#{@quiz.id}/reports",
           {
             controller: "quizzes/quiz_reports",
             action: "create",
             format: "json",
             course_id: @course.id.to_s,
             quiz_id: @quiz.id.to_s
           },
           params,
           headers
    end

    before :once do
      teacher_in_course(active_all: true)
      @me = @user
      simple_quiz_with_submissions %w[T T T], %w[T T T], %w[T F F], %w[T F T], user: @user, course: @course
      @user = @me
    end

    it "creates a new report" do
      expect(Quizzes::QuizStatistics.count).to eq 0
      json = api_create({ quiz_report: { report_type: "item_analysis" } })
      expect(Quizzes::QuizStatistics.count).to eq 1
      expect(json["id"]).to eq Quizzes::QuizStatistics.first.id
    end

    it "reuses an existing report" do
      Attachment.current_root_account = @course.root_account
      @quiz.statistics_csv("item_analysis")
      expect(Quizzes::QuizStatistics.count).to eq 1
      json = api_create({ quiz_report: { report_type: "item_analysis" } })
      expect(Quizzes::QuizStatistics.count).to eq 1
      expect(json["id"]).to eq Quizzes::QuizStatistics.first.id
    end

    context "JSON-API" do
      it "creates a new report" do
        expect(Quizzes::QuizStatistics.count).to eq 0

        json = api_create({
                            quiz_reports: [{
                              report_type: "item_analysis"
                            }]
                          },
                          { jsonapi: true })

        expect(Quizzes::QuizStatistics.count).to eq 1

        expect(json["quiz_reports"]).to be_present
        expect(json["quiz_reports"][0]["id"]).to eq Quizzes::QuizStatistics.first.id.to_s
      end
    end

    context "re-generation" do
      let(:job_tag) { Quizzes::QuizStatistics.csv_job_tag }
      let(:report_type) { "student_analysis" }

      it "works when a job had failed previously" do
        stats, original_job = *begin
          allow_any_instance_of(Quizzes::QuizStatistics::StudentAnalysis).to receive(:to_csv) {
            throw "simulated failure"
          }

          stats = @quiz.current_statistics_for(report_type)
          stats.generate_csv_in_background

          # keep a reference to the job before we run because it will get
          # migrated to the failed jobs table:
          job = Delayed::Job.where(tag: job_tag).first

          run_jobs

          [stats.reload, job]
        end

        expect(stats.csv_generation_failed?).to be_truthy

        api_create({
                     quiz_reports: [{
                       report_type:
                     }]
                   },
                   { jsonapi: true })

        new_job = Delayed::Job.where(tag: job_tag).first

        expect(new_job).to be_present
        expect(original_job.id).not_to eq new_job.id
      end

      it "returns 409 when report is being/already generated" do
        stats = @quiz.current_statistics_for(report_type, includes_sis_ids: true)
        stats.generate_csv_in_background

        api_create({
                     quiz_reports: [{
                       report_type:
                     }]
                   },
                   { jsonapi: true, raw: true })

        assert_status(409)
      end
    end
  end

  describe "DELETE /courses/:course_id/quizzes/:quiz_id/reports/:id [#abort]" do
    before :once do
      teacher_in_course(active_all: true)

      simple_quiz_with_submissions %w[T T T], %w[T T T], %w[T F F], %w[T F T], {
        user: @teacher,
        course: @course
      }
    end

    let(:report) { @quiz.current_statistics_for("student_analysis") }

    def api_abort
      raw_api_call(
        :delete,
        "/api/v1/courses/#{@course.id}/quizzes/#{@quiz.id}/reports/#{report.id}",
        {
          controller: "quizzes/quiz_reports",
          action: "abort",
          format: "json",
          course_id: @course.id.to_s,
          quiz_id: @quiz.id.to_s,
          id: report.id.to_s
        },
        {},
        {
          "Accept" => "application/vnd.api+json"
        }
      )
    end

    it "denies unprivileged access" do
      student_in_course(active_all: true)
      api_abort
      assert_forbidden
    end

    it "works when the report is already generated" do
      report.generate_csv
      api_abort
      assert_status(204)
      expect(report.reload.csv_attachment).to be_nil
    end

    it "works when the report is queued for generation" do
      report.generate_csv_in_background
      expect(report.reload.generating_csv?).to be true

      api_abort

      assert_status(204)
      expect(report.reload.generating_csv?).to be false
    end

    it "works when the report failed to generate" do
      report.generate_csv_in_background
      report.progress.fail

      api_abort
      assert_status(204)
    end

    it "does not work when the report is being generated" do
      report.generate_csv_in_background
      report.progress.start

      api_abort

      assert_status(422)
    end
  end

  describe "GET /courses/:course_id/quizzes/:quiz_id/reports/:id [show]" do
    def api_show(params = {}, options = {})
      method = options[:raw] ? :raw_api_call : :api_call
      headers = options[:jsonapi] ? { "Accept" => "application/vnd.api+json" } : {}
      send method,
           :get,
           "/api/v1/courses/#{@course.id}/quizzes/#{@quiz.id}/reports/#{@report.id}",
           {
             controller: "quizzes/quiz_reports",
             action: "show",
             format: "json",
             course_id: @course.id.to_s,
             quiz_id: @quiz.id.to_s,
             id: @report.id.to_s
           },
           params,
           headers
    end

    it "denies unprivileged access" do
      student_in_course(active_all: true)
      @quiz = @course.quizzes.create({ title: "Test Quiz" })
      @report = @quiz.current_statistics_for("student_analysis")
      api_show({}, raw: true)
      assert_forbidden
    end

    context "with privileged access" do
      before :once do
        teacher_in_course(active_all: true)
        @quiz = @course.quizzes.create({ title: "Test Quiz" })
        @report = @quiz.current_statistics_for("student_analysis")
      end

      it "shows the report" do
        json = api_show
        expect(json["id"]).to eq @report.id
        expect(json["report_type"]).to eq "student_analysis"
      end

      it "embeds its attachment automatically in JSON format" do
        Attachment.current_root_account = @course.root_account
        @report.generate_csv
        @report.reload

        json = api_show
        expect(json["file"]).to be_present
        expect(json["file"]["id"]).to eq @report.csv_attachment.id
      end

      context "JSON-API" do
        it "renders" do
          json = api_show({}, { jsonapi: true })
          expect(json["quiz_reports"]).to be_present
          expect(json["quiz_reports"][0]["id"]).to eq @report.id.to_s
          expect(json["quiz_reports"][0]["report_type"]).to eq "student_analysis"
        end

        it "embeds its attachment with ?include=file" do
          Attachment.current_root_account = @course.root_account
          @report.generate_csv
          @report.reload

          json = api_show({ include: ["file"] }, { jsonapi: true })
          expect(json["quiz_reports"][0]["file"]).to be_present
          expect(json["quiz_reports"][0]["file"]["id"]).to eq @report.csv_attachment.id
        end

        it "embeds its progress with ?include=progress" do
          @report.generate_csv_in_background
          @report.reload

          json = api_show({ include: ["progress"] }, { jsonapi: true })

          expect(json["quiz_reports"][0]["file"]).not_to be_present
          expect(json["quiz_reports"][0]["progress"]).to be_present
          expect(json["quiz_reports"][0]["progress"]["id"]).to eq @report.progress.id
        end
      end
    end # context 'with privileged access'
  end # API show
end
