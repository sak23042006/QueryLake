import sbtassembly.AssemblyPlugin.autoImport._
import sbtassembly.MergeStrategy
import sbt._

ThisBuild / scalaVersion := "2.12.18"   // optional but matches delta-spark 3.2.0
ThisBuild / version      := "0.1.0"
ThisBuild / organization := "com.example"

lazy val root = (project in file("."))
  .settings(
    name := "scala-etl",

    libraryDependencies ++= Seq(
      // Spark provided by the cluster image
      "org.apache.spark" %% "spark-core" % "3.5.0" % "provided",
      "org.apache.spark" %% "spark-sql"  % "3.5.0" % "provided",

      // Delta also provided at runtime via --packages
      "io.delta" %% "delta-spark" % "3.2.0" % "provided",

      // These you can safely bundle
      "org.apache.hadoop" % "hadoop-aws"          % "3.3.4",
      "com.amazonaws"     % "aws-java-sdk-bundle" % "1.12.673",
      "org.apache.pdfbox" % "pdfbox"              % "2.0.30"
    ),

    fork := true

    // you can drop this; Airflow's SparkSubmit will handle packages
    // Compile / run / javaOptions ++= Seq(
    //   "-Dspark.jars.packages=io.delta:delta-spark_2.12:3.2.0"
    // )
  )

assembly / mainClass := Some("jobs.RawIngestionJob")
assembly / assemblyJarName := "lakerag-etl.jar"

assembly / assemblyMergeStrategy := {
  case PathList("META-INF", _ @ _*) => MergeStrategy.discard
  case _                            => MergeStrategy.first
}
