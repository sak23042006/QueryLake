package etl.silver

object SilverCleaner {

  def cleanText(s: String): String = {
    if (s == null) return ""

    val cleaned =
      s.replaceAll("\\p{Cntrl}", " ")
        .replaceAll("<[^>]*>", " ")
        .replaceAll("&nbsp;", " ")
        .replaceAll("\\s+", " ")
        .trim
        .toLowerCase

    if (cleaned.isEmpty) "" else cleaned
  }
}
