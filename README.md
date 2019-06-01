#### trend-analysis
###
to compile:
sbt run
###
to run:
sbt run

it listens on port 9000

###
src is under app/:

models.scala defines the data structure used in parsing the data and calculation

parsers.scala defines the helper objects used in parsing the json

Transformer.scala, Stemmable.scala, and Tokenizer.scala are used for calculating word count for text-entry questions

SparkController.scala defines the web services 

SparkCommons set up globals and spark context


conf/routes defines web services routes

build.sbt defines dependencies.

testing scripts using curl are under directory test.

###
trend analysis Json:

{"projectId":112, "bucket": "month", "multiTimeSentOut":"no", "raw": "no" }

bucket -- "year", "month", "day", "hour", "minute", "second"
multiTimeSentOUt -- "yes" means calculate trends relative as many DateSent as found in the data
                    "no" means calculate trend relative to the first DateSent
raw   --- "no" means calculating stats in each bucket
          "yes" means returning raw data in each bucket

###
trend analysis result Json:

below case classes define the Json data structure

case class DataPoint(timeBucket: String, value: List[Double], words: List[String])

case class TrendItem(projectId: Long, questionId: Long, questionType: String, sentTime: Long, bucket: String, startTime: String, endTime: String, count: Long, data: Option[List[DataPoint]], labels: Option[List[String]])
-- count field indicates # of time buckets in the trend item
-- startTime and endTime indicate start and end time of the trend item
-- labels indicate the meaning of each data series in the data field

case class TrendItems(projectId: Long, timeSentOut: Long, trendItems: Option[List[TrendItem]])

case class TrendResult(projectId: Long, status: String, trends: Option[List[TrendItems]], sentOutTimes: Option[List[Long]])

-- one trend request gets back one TrendResult; each TrendResult contains multiple TrendItem, one TrendItem for each question relative to one DateSent(if multiTimeSentOut is "yes")
-- TrendResult also contains the list of available sentouts

##
Each multiple-choice question will have one TrendItem with DataPoint's tracking each choice's frequency in each bucket.

Sample Output:
{"projectId":112,"questionId":199,"questionType":"multiple-choice-text","sentTime":1460415906000,"bucket":"year","startTime":"20160101","endTime":"20160101","count":1,"data":[{"timeBucket":"20160101","value":[0,0,1,1,0,0,0,0,0,0,0,0,0,0],"words":[]}],"labels":["red","green","blue","gray","white","black","orange","yellow","transparent","deep blue","light gray","deep yellow","glow","other"]},

##
Each grid-scale question will have one TrendItem with DataPoint's tracking each choice/grid-scale pair's frequency in each bucket.

Sample Output:
{"projectId":112,"questionId":115,"questionType":"grid-scale","sentTime":1460415906000,"bucket":"year","startTime":"20160101","endTime":"20160101","count":1,"data":[{"timeBucket":"20160101","value":[6,3,7,6,6,4,8,4,4,8,3,4],"words":[]}],"labels":["disagree - do you like your boss","disagree - do you like your work env","disagree - feel good about your duties","disagree - how is the company food","neutral - do you like your boss","neutral - do you like your work env","neutral - feel good about your duties","neutral - how is the company food","agree - do you like your boss","agree - do you like your work env","agree - feel good about your duties","agree - how is the company food"]},

##
Each rank-order question will have one TrendItem with DataPoint's tracking each choice/rank pair's frequency in each bucket.

Sample Output:

{"projectId":112,"questionId":195,"questionType":"rank-order","sentTime":1460415906000,"bucket":"year","startTime":"20160101","endTime":"20160101","count":1,"data":[{"timeBucket":"20160101","value":[1,0,1,0,1,1,1,1,0],"words":[]}],"labels":["how much you like waking - Rank 1","how much you like waking - Rank 2","how much you like waking - Rank 3","how much you like racing - Rank 1","how much you like racing - Rank 2","how much you like racing - Rank 3","how much you like dancing - Rank 1","how much you like dancing - Rank 2","how much you like dancing - Rank 3"]}

##
Each text-entry question will have one TrendItem with DataPoint's containing top 100 words and their counts in each time bucket.  "words" in DataPoint class is only used in text-entry question.

Sample Output:

{"projectId":112,"questionId":120,"questionType":"text-entry","sentTime":1460415906000,"bucket":"year","startTime":"20160101","endTime":"20160101","count":1,"data":[{"timeBucket":"20160101","value":[1,1,1,1,1,1,1,1,1,1],"words":["x","xbbnhgfyt","xvsrrw","abc","ooooooooooo","nfemnewf","f","hf","bzbdh","grm"]}],"labels":["what would you like the most these days"]}


##
Each numeric/sliding-scale question will have one TrendItem that calculates min, mean-std, mean, mean+std and max for each time bucket. if "raw" is "yes", it will return raw data. "raw": "yes" should usually be combined with the smallest bucket "second".

Sample Output:
{"projectId":112,"questionId":122,"questionType":"numeric","sentTime":1460415906000,"bucket":"year","startTime":"20160101","endTime":"20160101","count":1,"data":[{"timeBucket":"20160101","value":[1,5.035297264950259,42.3125,79.58970273504974,100],"words":[]}],"labels":["max","mean+std","mean","mean-std","min"]},

{"projectId":112,"questionId":197,"questionType":"sliding-scale","sentTime":1460415906000,"bucket":"year","startTime":"20160101","endTime":"20160101","count":1,"data":[{"timeBucket":"20160101","value":[4,6.535898384862246,10,13.464101615137753,16],"words":[]}],"labels":["max","mean+std","mean","mean-std","min"]},

