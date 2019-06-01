package controllers

import play.api.mvc._
import play.api.libs.ws._
import play.api.libs.json._
import javax.inject.Inject

import play.api.libs.concurrent.Execution.Implicits.defaultContext
import scala.concurrent.Await
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util._

import controllers._
import controllers.JsonParsers._
import controllers.QuestionType._

/**
 * @author Xin Jin
 */
class SparkController @Inject() (ws: WSClient) extends Controller {
  val stopWordsFile = "resources/stopwords_en.txt"
  lazy val stopWords = scala.io.Source.fromFile(stopWordsFile).getLines.toList.map(_.trim)

  val apiUrl = "http://staging.frontier7.com/api/projects/"

  def headers = List(
    "Access-Control-Allow-Origin" -> "*",
    "Access-Control-Allow-Methods" -> "GET, POST, OPTIONS",
    "Access-Control-Max-Age" -> "3600",
    "Access-Control-Allow-Headers" -> "Origin, Content-Type, Accept, Authorization",
    "Access-Control-Allow-Credentials" -> "true",
    "Allow" -> "*"
  )

  def index = Action {
    Ok("hello world")
  }

  def options = Action { request =>
    NoContent.withHeaders(headers: _*)
  }

  /**
   * dataframe can output, with toJSON, a list of json string. They just need to be wrapped with [] and commas
   * @param rdd
   * @return
   */
  //  def toJsonString(rdd: DataFrame): String =
  //    "[" + rdd.toJSON.collect.toList.mkString(",\n") + "]"

  /**
   * trend analysis
   * @return
   */
  def trend = Action.async(BodyParsers.parse.json) {
    request =>
      {
        val trendResult = request.body.validate[Trend]
        trendResult.fold(
          errors =>
            {
              Future {
                val trendResult = new TrendResult(0, "FAILURE:bad trend specs", None, None)
                Ok(Json.toJson(trendResult)).withHeaders(headers: _*)
              }
            },
          trend => {
            try {
              val results = getQuestionsAndResponses(trend.projectId.toLong)
              val questions = results._1
              val responseStubs = results._2
              val responses = results._3
              val calc = new Calculation()
              Future {
                Ok(Json.toJson(calc.calculateTrend(trend, questions, responses.filter(_.responses.length > 0).sortWith(_.responses(0).added > _.responses(0).added), stopWords))).withHeaders(headers: _*)
              }
            } catch {
              case e: Exception => {
                Future {
                  Ok(Json.toJson(new TrendResult(trend.projectId.toLong, e.toString, None, None))).withHeaders(headers: _*)
                }
              }
              case t: Throwable => {
                Future {
                  Ok(Json.toJson(new TrendResult(trend.projectId.toLong, t.toString, None, None))).withHeaders(headers: _*)
                }
              }
            }
          }
        )
      }
  }

  def getQuestionsAndResponses(projectId: Long): Tuple3[Questions, ResponseStubs, List[Response]] = {
    val url1 = apiUrl + projectId + "/questions"
    val url2 = apiUrl + projectId + "/responses"
    var responsesF = Seq(ws.url(url1).get(), ws.url(url2).get())
    var all = Future.sequence(responsesF)
    var results = Await.result(all, 30 seconds)

    val questionsResult = results(0).json.validate[Questions]
    val questions = questionsResult.get
    val responseStubsResult = results(1).json.validate[ResponseStubs]
    val responseStubs = responseStubsResult.get

    val url = apiUrl + projectId + "/responses/"
    responsesF = for (stub <- responseStubs.responses) yield ws.url(url + stub.id + "?raw=true").get()
    all = Future.sequence(responsesF)
    results = Await.result(all, 300 seconds)

    var responseList = List[Response]()
    for (result <- results) {
      val response = result.json.validate[Response]
      response.fold(
        errors => {
          Future { BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors))) }
        },
        response => {
          responseList = response :: responseList
        }
      )
    }
    Tuple3(questions, responseStubs, responseList)
  }

  def responseStubs = Action.async(BodyParsers.parse.json) {
    request =>
      {
        val trendResult = request.body.validate[Trend]
        trendResult.fold(
          errors =>
            {
              Future { BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors))) }
            },
          trend => {
            val json = Json.toJson(trend)
            val url = apiUrl + trend.projectId + "/responses"
            ws.url(url).get().map {
              response =>
                {
                  val responseStubs = response.json.validate[ResponseStubs]
                  responseStubs.fold(
                    errors => {
                      BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors)))
                    },
                    responseStubs => {
                      Ok(Json.toJson(responseStubs))
                    }
                  )
                }
            }
          }
        )
      }
  }

  def response = Action.async(BodyParsers.parse.json) {
    request =>
      {
        val trendResult = request.body.validate[Trend]
        trendResult.fold(
          errors =>
            {
              Future { BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors))) }
            },
          trend => {
            val results = getQuestionsAndResponses(trend.projectId.toLong)
            val questions = results._1
            val responseStubs = results._2
            val responses = results._3
            Future {
              Ok(Json.toJson(responses))
            }
          }
        )
      }
  }

  def questions = Action.async(BodyParsers.parse.json) {
    request =>
      {
        val trendResult = request.body.validate[Trend]
        trendResult.fold(
          errors =>
            {
              Future { BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors))) }
            },
          trend => {
            val json = Json.toJson(trend)
            val url = apiUrl + trend.projectId + "/questions"
            ws.url(url).get().map {
              response =>
                {
                  val questions = response.json.validate[Questions]
                  questions.fold(
                    errors => {
                      BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors)))
                    },
                    questions => {
                      Ok(Json.toJson(questions))
                    }
                  )
                }
            }
          }
        )
      }
  }

}

