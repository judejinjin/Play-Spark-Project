package controllers

import play.api.libs.json._
import play.api.libs.functional.syntax._

object JsonParsers {

  implicit val rankOrderDataPointReads = Json.reads[RankOrderDataPoint]
  implicit val rankOrderDataPointWrites = Json.writes[RankOrderDataPoint]

  implicit val rankOrderDataPointsReads = Json.reads[RankOrderDataPoints]
  implicit val rankOrderDataPointsWrites = Json.writes[RankOrderDataPoints]

  implicit val gridScaleDataPointReads = Json.reads[GridScaleDataPoint]
  implicit val gridScaleDataPointWrites = Json.writes[GridScaleDataPoint]

  implicit val gridScaleDataPointsReads = Json.reads[GridScaleDataPoints]
  implicit val gridScaleDataPointsWrites = Json.writes[GridScaleDataPoints]

  implicit val otherReads = Json.reads[Other]
  implicit val otherWrites = Json.writes[Other]

  implicit val dataPointReads = Json.reads[DataPoint]
  implicit val dataPointWrites = Json.writes[DataPoint]

  implicit val trendItemReads = Json.reads[TrendItem]
  implicit val trendItemWrites = Json.writes[TrendItem]

  implicit val trendItemsReads = Json.reads[TrendItems]
  implicit val trendItemsWrites = Json.writes[TrendItems]

  implicit val trendResultReads = Json.reads[TrendResult]
  implicit val trendResultWrites = Json.writes[TrendResult]

  implicit val trendReads = Json.reads[Trend]
  implicit val trendWrites = Json.writes[Trend]

  implicit val responseStubReads = Json.reads[ResponseStub]
  implicit val responseStubWrites = Json.writes[ResponseStub]

  implicit val responseStubsReads = Json.reads[ResponseStubs]
  implicit val responseStubsWrites = Json.writes[ResponseStubs]

  implicit val f7optionReads = Json.reads[F7Option]
  implicit val f7optionWrites = Json.writes[F7Option]

  implicit val statementReads = Json.reads[Statement]
  implicit val statementWrites = Json.writes[Statement]

  implicit val projectReads = Json.reads[Project]
  implicit val projectWrites = Json.writes[Project]

  implicit val questionReads: Reads[Question] = (
    (JsPath \ "order").read[Int] and
    (JsPath \ "number").read[Int] and
    (JsPath \ "title").read[String] and
    (JsPath \ "options").readNullable[List[F7Option]] and
    (JsPath \ "allowMultiple").readNullable[Boolean] and
    (JsPath \ "other").readNullable[Boolean] and
    (JsPath \ "singleRow").readNullable[Boolean] and
    (JsPath \ "requiresForceRanking").readNullable[Boolean] and
    (JsPath \ "statements").readNullable[List[Statement]] and
    (JsPath \ "required").readNullable[Boolean] and
    (JsPath \ "type").read[String] and
    (JsPath \ "id").read[Long] and
    (JsPath \ "projectId").read[Long]
  )(Question.apply _)

  implicit val questionWrites: Writes[Question] = (
    (JsPath \ "order").write[Int] and
    (JsPath \ "number").write[Int] and
    (JsPath \ "title").write[String] and
    (JsPath \ "options").writeNullable[List[F7Option]] and
    (JsPath \ "allowMultiple").writeNullable[Boolean] and
    (JsPath \ "other").writeNullable[Boolean] and
    (JsPath \ "singleRow").writeNullable[Boolean] and
    (JsPath \ "requiresForceRanking").writeNullable[Boolean] and
    (JsPath \ "statements").writeNullable[List[Statement]] and
    (JsPath \ "required").writeNullable[Boolean] and
    (JsPath \ "type").write[String] and
    (JsPath \ "id").write[Long] and
    (JsPath \ "projectId").write[Long]
  )(unlift(Question.unapply))

  implicit val questionsReads = Json.reads[Questions]
  implicit val questionsWrites = Json.writes[Questions]

  implicit val answerReads = Json.reads[Answer]
  implicit val answerWrites = Json.writes[Answer]

  implicit val responseReads = Json.reads[Response]
  implicit val responseWrites = Json.writes[Response]
}