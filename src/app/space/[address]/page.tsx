type Props = {
  params: {
    address: string;
  };
};

export default function ProductPage({ params }: Props) {
  return (
    <div>
      <h1>Space</h1>
      <p>{params.address}</p>
    </div>
  );
}
