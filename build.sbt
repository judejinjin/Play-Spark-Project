import play.sbt.PlayImport._
import play.sbt.routes.RoutesKeys._


name         := """f7-spark"""
organization := "frontier7"
version      := "0.0.1"
scalaVersion := Version.scala

lazy val root = (project in file(".")).enablePlugins(PlayScala)

//scalaSource in Compile <<= baseDirectory / "src/scala"

libraryDependencies ++= Dependencies.sparkAkkaHadoop

libraryDependencies ++= Seq(
 "org.scalanlp" %% "breeze" % "0.11.2",
 "org.scalanlp" % "chalk" % "1.3.0" intransitive(),
 "org.scalanlp" % "nak" % "1.2.0" intransitive(),
  filters,
  ws
)

dependencyOverrides ++= Set(
  "com.fasterxml.jackson.core" % "jackson-databind" % "2.7.1"
)

releaseSettings

scalariformSettings

ivyScala := ivyScala.value map { _.copy(overrideScalaVersion = true) }

routesGenerator := InjectedRoutesGenerator

//initialCommands in console := """
//  |import akka.stream._
//  |import play.api.http._
//  |""".stripMargin

fork in run := false