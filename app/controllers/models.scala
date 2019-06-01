package controllers

import play.api.libs.json._
import play.api.libs.functional.syntax._
import java.text.SimpleDateFormat

case class Other(other: String)

case class RankOrderDataPoint(option: Int, position: Int)

case class RankOrderDataPoints(data: List[RankOrderDataPoint])

case class GridScaleDataPoint(statement: Int, position: Int)

case class GridScaleDataPoints(data: List[GridScaleDataPoint])

case class F7Option(position: String, label: String)

case class Statement(position: String, label: String)

case class Question(order: Int, number: Int, title: String, options: Option[List[F7Option]], allowMultiple: Option[Boolean], other: Option[Boolean], singleRow: Option[Boolean], requiresForceRanking: Option[Boolean], statements: Option[List[Statement]], required: Option[Boolean], Type: String, id: Long, projectId: Long)

case class Project(id: Long, name: String, welcome: String, terms: String, requiresSignature: Boolean, endOfSurvey: String, added: Long)

case class Questions(success: Boolean, memberType: Int, project: Project, questions: List[Question])

case class ResponseStub(id: Long, number: Long, sentDate: Long, added: Long, duration: Long, answers: Int)

case class ResponseStubs(success: Boolean, memberType: Int, responses: List[ResponseStub])

case class Answer(id: Long, questionId: Long, data: String, added: Long)

case class Response(responses: List[Answer], success: Boolean, number: Int, sentDate: Long)

case class Trend(projectId: String, bucket: String, multiTimeSentOut: String, raw: String)

case class DataPoint(timeBucket: String, value: List[Double], words: List[String])

case class TrendItem(projectId: Long, questionId: Long, questionType: String, questionNumber: Int, questionTitle: String, sentTime: Long, bucket: String, startTime: String, endTime: String, count: Long, data: Option[List[DataPoint]], labels: Option[List[String]])

case class TrendItems(projectId: Long, timeSentOut: Long, trendItems: Option[List[TrendItem]])

case class TrendResult(projectId: Long, status: String, trends: Option[List[TrendItems]], sentOutTimes: Option[List[Long]])

//define some constants
object QuestionType {
  val MultipleChoiceText = "multiple-choice-text"
  val MultipleChoiceImage = "multiple-choice-image"
  val GridScale = "grid-scale"
  val RankOrder = "rank-order"
  val SlidingScale = "sliding-scale"
  val TextEntry = "text-entry"
  val Numeric = "numeric"
}

object TimeBucket {
  val YEAR = "year"
  val MONTH = "month"
  val WEEK = "week"
  val DAY = "day"
  val HOUR = "hour"
  val MINUTE = "minute"
  val SECOND = "second"
}

object DateFormatters {
  val yyyyMMDD = new SimpleDateFormat("YYYYMMdd")
  val yyyyMMDDhhmmss = new SimpleDateFormat("YYYYMMdd:hhmmss")
}

object YesNo {
  val YES = "yes"
  val NO = "no"
}