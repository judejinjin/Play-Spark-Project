package controllers

import play.api.libs.json._
import java.util.Date
import java.text.SimpleDateFormat

import controllers._
import controllers.JsonParsers._
import controllers.DateFormatters._
import controllers.QuestionType._
import controllers.TimeBucket._
import controllers.YesNo._
import controllers.Transformer._

class Calculation {

  def calculateTrend(trend: Trend, questions: Questions, responses: List[Response], stopWords: List[String]): TrendResult = {

    var timeSentOutList = List[Long]()
    var sentOutTimes = List[Long]()

    sentOutTimes = responses.map(x => x.sentDate).distinct.sorted

    trend.multiTimeSentOut match {
      case YES => timeSentOutList = sentOutTimes
      case NO => timeSentOutList = responses.map(x => x.sentDate).min :: timeSentOutList
    }

    var trendResult = List[TrendItems]()
    val sortedQuestions = questions.questions.sortWith(_.number > _.number)

    for (timeSentOut <- timeSentOutList) {
      var trendItems = List[TrendItem]()

      var filteredResponses = List[Response]()
      if (timeSentOutList.length > 1)
        filteredResponses = responses.filter(_.sentDate == timeSentOut)
      else
        filteredResponses = responses

      val maxTime = filteredResponses.map(x => x.sentDate).max
      for (question <- sortedQuestions) {
        trendItems = analyseTrendItem(trend, question, filteredResponses, timeSentOut, maxTime, stopWords) :: trendItems
      }

      val items = new TrendItems(trend.projectId.toLong, timeSentOut, Option(trendItems))
      trendResult = items :: trendResult
    }

    new TrendResult(trend.projectId.toLong, "SUCCESS", Option(trendResult.reverse), Option(sentOutTimes))

  }

  def analyseTrendItem(trend: Trend, question: Question, responses: List[Response], start: Long, end: Long, stopWords: List[String]): TrendItem = {

    var currentBucket: String = ""
    var labels = getLabels(question, trend)
    var dataPoints = List[DataPoint]()
    var bucketData = List[Response]()

    for (response <- responses) {

      var bucket = getTimeBucket(response.responses(0).added, trend.bucket)

      if (currentBucket.equals("") || !bucket.equals(currentBucket)) {
        if (!currentBucket.equals(""))
          dataPoints = getBucketDataPoint(trend, question, bucketData, currentBucket, labels, stopWords) :: dataPoints

        currentBucket = bucket
        bucketData = List[Response]()
        bucketData = response :: bucketData
      } else {
        bucketData = response :: bucketData
      }
    }

    if (bucketData.length > 0)
      dataPoints = getBucketDataPoint(trend, question, bucketData, currentBucket, labels, stopWords) :: dataPoints

    new TrendItem(question.projectId, question.id, question.Type, question.number, question.title, start, trend.bucket, getTimeBucket(start, trend.bucket), getTimeBucket(end, trend.bucket), dataPoints.length, Option(dataPoints), Option(labels))

  }

  def getBucketDataPoint(trend: Trend, question: Question, bucketData: List[Response], bucket: String, labels: List[String], stopWords: List[String]): DataPoint = {
    var data = List[Double]()
    var counters = new Array[Double](labels.length)
    var topWords = List[String]()

    question.Type match {
      case MultipleChoiceText | MultipleChoiceImage => {
        for (response <- bucketData) {
          val answer = response.responses.filter(_.questionId == question.id)
          if (answer.length > 0) {
            val choices = getMultipleChoiceData(answer(0).data, labels)
            for (choice <- choices) {
              counters(choice.toInt - 1) += 1
            }
          }
        }
        data = counters.toList
      }
      case GridScale => {
        for (response <- bucketData) {
          val answer = response.responses.filter(_.questionId == question.id)
          if (answer.length > 0) {
            val scales = getGridScaleData(question, answer(0).data, labels)
            for (scale <- scales) {
              counters(scale.toInt - 1) += 1
            }
          }
        }
        data = counters.toList
      }
      case RankOrder => {
        for (response <- bucketData) {
          val answer = response.responses.filter(_.questionId == question.id)
          if (answer.length > 0) {
            val ranks = getRankOrderData(question, answer(0).data, labels)
            for (rank <- ranks) {
              counters(rank.toInt - 1) += 1
            }
          }
        }
        data = counters.toList
      }
      case SlidingScale | Numeric => {
        trend.raw match {
          case YES => {
            var numbers = List[Double]()
            for (response <- bucketData) {
              val answer = response.responses.filter(_.questionId == question.id)
              if (answer.length > 0) {
                numbers = answer(0).data.toDouble :: numbers
              }
            }
            data = numbers.toList
          }
          case NO => {
            var stats = Array[Double](0, 0, 0, 0, 0)
            var numbers = List[Double]()
            for (response <- bucketData) {
              val answer = response.responses.filter(_.questionId == question.id)
              if (answer.length > 0) {
                numbers = answer(0).data.toDouble :: numbers
              }
            }
            if (numbers.length > 0) {
              val mean = numbers.sum / numbers.length
              val std = Math.sqrt(numbers.map(number => (number - mean) * (number - mean)).sum / numbers.length)

              stats(0) = numbers.min
              stats(1) = mean - std
              stats(2) = mean
              stats(3) = mean + std
              stats(4) = numbers.max
            }
            data = stats.toList
          }
        }
      }
      case TextEntry => {
        var words = List[String]()
        var counters = List[Double]()

        for (response <- bucketData) {
          val answer = response.responses.filter(_.questionId == question.id)
          if (answer.length > 0) {
            words = words ++ Tokenizer.unigram(answer(0).data.toLowerCase).filter(w => !stopWords.contains(w))

            //stemming is not good, disabled for now
            //transform(Tokenizer.unigram(answer(0).data.toLowerCase).filter(w => !stopWords.contains(w)).mkString(" "))
            //transform(answer(0).data.toLowerCase).filter(w => !stopWords.contains(w))
          }
        }

        val wordCounters = words.map(x => (x, 1)).groupBy(_._1).map { case (group, traversable) => traversable.reduce { (a, b) => (a._1, a._2 + b._2) } }.toList.sortWith(_._2 > _._2).take(100)

        var tWords = List[String]()
        for ((word, count) <- wordCounters) {
          tWords = tWords ++ List(word)
          counters = counters ++ List(count.toDouble)
        }
        data = counters
        topWords = tWords
      }
      case _ => {
        data = 0 :: data
      }
    }

    new DataPoint(bucket, data, topWords)
  }

  def getMultipleChoiceData(data: String, labels: List[String]): List[String] = {
    val choices = data.substring(1, data.length - 1).split(",")
    val counters = new Array[String](choices.length)
    var index = 0
    for (choice <- choices) {
      if (choice.indexOf("other") > 0) {
        counters(index) = labels.length.toString
      } else {
        counters(index) = choice
      }
      index += 1
    }
    counters.toList
  }

  def getRankOrderData(question: Question, data: String, labels: List[String]): List[String] = {
    var counters = List[String]()
    val dataPoints = Json.parse("{\"data\":" + data + "}").validate[RankOrderDataPoints]
    dataPoints.fold(
      errors => {
        counters = ("{\"data\":" + data + "}") :: counters
      },
      dataPoints => {
        for (dataPoint <- dataPoints.data) {
          counters = (dataPoint.option + question.options.get.length * (dataPoint.position - 1)).toString :: counters
        }
      }
    )

    counters
  }

  def getGridScaleData(question: Question, data: String, labels: List[String]): List[String] = {

    var counters = List[String]()
    question.singleRow match {
      case Some(f) => {
        if (f) {
          counters = data :: counters
        } else {
          val dataPoints = Json.parse("{\"data\":" + data + "}").validate[GridScaleDataPoints]
          dataPoints.fold(
            errors => {
              counters = ("{\"data\":" + data + "}") :: counters
            },
            dataPoints => {
              for (dataPoint <- dataPoints.data) {
                counters = ((dataPoint.statement - 1) * question.options.get.length + dataPoint.position).toString :: counters
              }
            }
          )
        }
      }
      case None => {
        counters = data :: counters
      }
    }

    counters
  }

  def getTimeBucket(time: Long, bucket: String): String = {
    val d = new Date(time)

    bucket match {
      case YEAR => yyyyMMDD.format(d).substring(0, 4).concat("0101")
      case MONTH => yyyyMMDD.format(d).substring(0, 6).concat("01")
      case HOUR => {
        yyyyMMDDhhmmss.format(d).substring(0, 11).concat("0001")
      }
      case MINUTE => {
        yyyyMMDDhhmmss.format(d).substring(0, 13).concat("01")

      }
      case SECOND => {
        yyyyMMDDhhmmss.format(d)
      }
      case _ => yyyyMMDD.format(d)
    }

  }

  def getLabels(question: Question, trend: Trend): List[String] = {
    var labels = List[String]()

    question.Type match {
      case MultipleChoiceText | MultipleChoiceImage => {
        for (option <- question.options.get) {
          labels = option.label :: labels
        }
        question.other match {
          case Some(f) => labels = "other" :: labels
          case None => labels
        }
      }
      case GridScale => {
        for (option <- question.options.get) {
          for (statement <- question.statements.get) {
            labels = (option.label + " - " + statement.label) :: labels
          }
        }
      }
      case RankOrder => {
        for (option1 <- question.options.get) {
          for (rank <- 1 to question.options.get.length) {
            labels = (option1.label + " - Rank " + rank) :: labels
          }
        }
      }
      case SlidingScale | Numeric => {
        trend.raw match {
          case YES => {
            labels = question.title :: labels
          }
          case NO => {
            labels = List("max", "mean+std", "mean", "mean-std", "min")
          }
        }
      }
      case TextEntry => {
        labels = question.title :: labels
      }
      case _ => labels = "UNKNOWN" :: labels
    }

    labels.reverse
  }

}