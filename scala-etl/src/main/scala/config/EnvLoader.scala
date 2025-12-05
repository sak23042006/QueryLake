package config

import java.io.FileInputStream
import java.util.Properties
import scala.collection.JavaConverters._

object EnvLoader {

  def loadEnv(): Map[String, String] = {

    val filePath = ".env"
    val props = new Properties()

    // Try loading .env
    try {
      val fis = new FileInputStream(filePath)
      props.load(fis)
      fis.close()

      println("[EnvLoader] Loaded .env:")
      return props.stringPropertyNames().asScala.map { key =>
        val value = props.getProperty(key)
        println(s" - $key=${value.take(4)}***")
        key -> value
      }.toMap
    }
    catch {
      case _: Throwable =>
        println("[EnvLoader] .env file not found → using system environment variables")
    }

    // If .env not found → fallback to system env
    System.getenv().asScala.toMap
  }
}
