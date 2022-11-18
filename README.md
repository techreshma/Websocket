# websocket example

This is the source code for a very simple client-server connection with websocket.io

Please refer to it to learn how to run this application.

clone application by using the url

1. npm install
2. client side url is http://localhost:5000/
3. server side url is http://localhost:5000/server
4. Client side UI have a textarea with send button. Message pattern looke like below
   {
   "type": Subscribe | Unsubscribe | CountSubscribers
   }
5. In case of Subscribe was requested server should answer with status message Subscribed
   and timestamp when it took place after await for 4 seconds in server page
   {
   "type": Subscribe,
   "status": "Subscribed",
   "updatedAt": ***
   }
6. In case of Unsubscribe was requested server should answer with status message
   Unsubscribed and timestamp when it took place after await for 8 seconds.
   {
   "type": Unsubscribe,
   "status": "unsubscribed",
   "updatedAt": ***
   }
7. In case of CountSubscribers was requested server should answer with number of current
   subscriptions and timestamp when it was counted.
   {
   "type": CountSubscribers,
   count: ***
   "updatedAt": ***
   }
8. On any other requests, server should return error message:
   {
   "type": error,
   "error": "Requested method not implemented",
   "updatedAt": ***
   }
9.    And in case of request was made with non-than json payload server should return this error
      message:
      {"type": error,
      "error": "Bad formatted payload, non JSON",
      "updatedAt": ***
      }
10.In addition to this methods, server should produce heartbeat events every second:
      {
      "type": heartbeat,
      "updatedAt": ***
      }
