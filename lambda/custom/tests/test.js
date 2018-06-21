const qa = require('../modules/qa.js');

qa.getQuestionById('question-two').then(function (data) {
  let answer = data[0].answer;
  let prompt = data[0].prompt;
  console.log(answer + ' ' + prompt);
}).catch(function(err){
  console.log(err)
})
