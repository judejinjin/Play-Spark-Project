package controllers

trait Transformer {

  def transform: String => Seq[String]

}

object Transformer {

  def transform: String => Seq[String] =
    EnglishStemmer andThen
      { (sentence: String) => Tokenizer.unigram(sentence) }

}