import { Ticket } from '../ticket';

it('implements optmistic concurrency control', async () => {
  // create instance of ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });
  // save ticket to db
  await ticket.save();
  // fetch ticket twice
  const firstInst = await Ticket.findById(ticket.id);
  const secondInst = await Ticket.findById(ticket.id);
  // make changes to the ticket
  firstInst!.set({ price: 10 });
  secondInst!.set({ price: 15 });
  // save the first fetched ticket
  await firstInst!.save();
  // save the second fetched ticket
  try {
    await secondInst!.save();
  } catch (err) {
    return;
  }
  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
