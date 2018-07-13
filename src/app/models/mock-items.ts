import { Action } from '@ngrx/store';

import * as uuid from 'uuid';

import { Item } from '../models/item.model';

export const ITEMS = [];

// A static list of JsonLdObjects
export const JLOs = [
  {  '@type': 'NoteDigitalDocument',
     '@context': 'https://schema.org/',
     'text': 'This is a simple note',
     'dateCreated': '2015-01-25T12:34:56Z'
  },
 {  '@type': 'http://schema.org/Person',
     '@context': 'https://schema.org/',
     'name': 'Jane Doe',
     'jobTitle': 'Professor',
     'telephone': '(425) 123-4567',
     'url': 'https://www.janedoe.com'
  },
  {  '@type': 'http://schema.org/Event',
     '@context': 'https://schema.org',
     'eventStatus': 'https://schema.org/EventCancelled',
     'location': {
       '@type': 'Place',
       'address': {
         '@type': 'PostalAddress',
         'addressLocality': 'Denver',
         'addressRegion': 'CO',
         'postalCode': '80209',
         'streetAddress': '7 S. Broadway'
       },
       'name': 'The Hi-Dive'
     },
     'name': 'CANCELLED - Typhoon with Radiation City',
     'offers': {
       '@type': 'Offer',
       'price': '13.00',
       'priceCurrency': 'USD',
       'url': 'https://www.ticketfly.com/purchase/309433'
     },
     'startDate': '2013-09-14T21:30'
  },
  {  '@type': 'Event',
     '@context': 'https://schema.org',
     'name': 'Miami Heat at Philadelphia 76ers - Game 3 (Home Game 1)',
     'location': {
       '@type': 'Place',
       'address': {
         '@type': 'PostalAddress',
         'addressLocality': 'Philadelphia',
         'addressRegion': 'PA'
       },
       'url': 'wells-fargo-center.html'
     },
     'offers': {
       '@type': 'AggregateOffer',
       'lowPrice': '$35',
       'offerCount': '1938'
     },
     'startDate': '2016-04-21T20:00',
     'url': 'nba-miami-philidelphia-game3.html'
  }
];


