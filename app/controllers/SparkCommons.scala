package controllers

import org.apache.spark.sql.SQLContext
import org.apache.spark.{ SparkContext, SparkConf }

/**
 * Handles configuration, context and so
 *
 * @author Xin Jin
 */
object SparkCommons {
  //build the SparkConf  object at once
  lazy val conf = {
    new SparkConf(false)
      .setMaster("local[*]")
      .setAppName("f7-spark-play")
      .set("spark.logConf", "true")
  }

  lazy val sc = SparkContext.getOrCreate(conf)
  lazy val sqlContext = new SQLContext(sc)
}
