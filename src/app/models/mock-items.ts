import { Action } from '@ngrx/store';

import { Item } from '../models/item.model';

export const ITEMS: Item[] = [
  new Item(
    'http://ltp.shawnlower.net/i/0',
    'http://schema.org/NoteDigitalDocument',
    {
      '@context': 'https://schema.org/',
      '@type': 'NoteDigitalDocument',
      'text': 'This is a simple note',
      'dateCreated': '2015-01-25T12:34:56Z'
    }),
  new Item(
    'http://www.ticketfly.com/event/309433',
    'http://schema.org/Event',
    {
      '@context': 'http://schema.org',
      '@type': 'Event',
      'eventStatus': 'http://schema.org/EventCancelled',
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
        'url': 'http://www.ticketfly.com/purchase/309433'
      },
      'startDate': '2013-09-14T21:30'
    }),
  new Item(
    'https://www.janedoe.com',
    'https://schema.org/Person',
    {
      '@context': 'https://schema.org/',
      '@type': 'Person',
      'name': 'Jane Doe',
      'jobTitle': 'Professor',
      'telephone': '(425) 123-4567',
      'url': 'https://www.janedoe.com'
    })
];
