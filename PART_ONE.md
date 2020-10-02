# Administration Platform

## Authentication
I would need a way to authenticate users into the application. Hopefully there is some sort of identity provider (IDP) available at my company. If so I would leverage that IDP to generate a _signed_ JWT for the user. It would be attached to their account object after IDP validation and returned as a cookie.

## Authorization
I would design the authorization for this administrative dashboard to include ownership over the objects created by a given administrator. The user would have to be an Admin to create objects and would have to own an object in order to edit, cancel, delete, etc. This is a combination of role based access control (RBAC) and attribute based access control (ABAC)

To be honest, this is likely a problem I don't need to reinvent a solution for. In the past I have used (and enjoyed) https://casbin.org/ to do authorization.

## Multiple Choice Data Structure
A multiple choice question could have answers that are generic, for instance:
> What percentage of the population has ever received rabies shots?
1. < 25%
2. 25%-50%
3. 50%-75%
4. \> 75%

While it's nice (in my head) to create normalized data, I think the complexity overhead of trying to reuse generic multiple choice questions is not worth the savings in storage space. My mulitple choice questions would be single purpose units, meaning they contain all the information needed to be a complete set of questions in one place.

This kind of structure lends itself pretty well to a document based DB because you can have 5 questions, or 10 questions, and you don't need to do a JOIN with a questions table. 

```javascript
{
  id: "98372408-5d56-4e70-b71c-2c162967083a",
  title: "Gorge of Eternal Peril",
  questions: [
    { 
      id: "c96c9899-0dfd-43ec-abef-d9d8b1f1e85b",
      text: "What is your favorite color?",
      weight: 0.23,
      options: [
        {
          id: "f803c4c4-d26f-440d-8411-18a6fbcca968",
          label: "A",
          text: "Blue",
        },
        ...moreOptions
      ]
    },
    ...moreQuestions
  ],
  ...additionalMetaData
}
```

You could feasibly add whatever metadata is necessary during a contest, such as a start and end date.
The weight of a question could also be used to have a set of scaled difficulty questions. The total weights would add up to 1, with more difficult or valuable questions awarding more credit in the contest.

## Responses
A user presumably is only allowed to respond once to a given contest one time. If that's the case, then there should be a response object with a composite primary key that consists of the contest id and the user's id. The database itself should have the unique constraint on these fields to prevent ever allowing multiple entries for the same contestant.

You'd also need to know each option the user selected for the contest. I don't know if partial entries should be saved, if so I would advocate for the user being able to change their entry up until the contest's end date. 

A response object could look like this:

```javascript
{
  id: "b8828116-9d5a-4325-8bff-525c42fd3eee",
  userId: "64a42b35-5ec6-4087-bca1-9d2c19ca21d1",
  contestID: "98372408-5d56-4e70-b71c-2c162967083a",
  answers: {
    "c96c9899-0dfd-43ec-abef-d9d8b1f1e85b": { // Question ID
      id: "f803c4c4-d26f-440d-8411-18a6fbcca968", // Option ID
      label: "A",
      text: "Blue",
      answerTime: "2020-01-01T00:30:00Z",
      ...additionalMetadata
    }
  }
}
```

I would want to snapshot everything about the option the user selected at the time of answering the question. Using an object for answers will also prevent multiple options from being selected for a given question.

## Editing
You can't just change your options in the middle of a contest. Editing one of these contests should be closed while its within its run time. It may even be worth having a service responsible for moving the record from a read/write collection to a collection that can only be _read_ by the API account in the database. This would prevent bugs from editing a contest in progress, assuming permissions were granted properly in the database.

Otherwise, there should be no reason one of these can't be edited, so long as it has not yet started. Deleting it, as far as the user is concerned, should be considered "cancelling" it. I would use terminology like cancel, end early, or reschedule. Cancelling a contest in progress may be necessary so that would need to be accounted for. I would add a cancelledTime field to the data structure to account for the difference between a contest ending and a contest being actively cancelled.