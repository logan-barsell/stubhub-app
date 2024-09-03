import { useState, useEffect } from 'react';
import useRequest from '../../hooks/use-request';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  const { doRequest, errs } = useRequest({
    url: `/api/payments`,
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: payment => Router.push('/orders'),
  });

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      <h1>{order.id}</h1>
      <div>Time left to pay: {timeLeft} seconds</div>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey='pk_test_51PoxdSFKPdNMcyVJFZB4Lyd4lcZExDhjg1wfDlxqG10OdD0kMl0KtiHViVVXRWuhyRKUoFLtgShz7Vtfn9H4CT2A000I1wPU4L'
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errs}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
