import {nanoServer} from '../lib/server';

import type {StringifyableRecord} from '@alwatr/type';

nanoServer.route<StringifyableRecord>('GET', '/', () => ({
  ok: true,
  data: {
    app: '..:: Soffit Order Admin API ::..',
    message: 'Hello ;)',
  },
}));
