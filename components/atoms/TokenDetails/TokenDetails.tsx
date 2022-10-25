interface ITokenDetails {
  title: string;
  address: string;
  url: string;
}

const TokenDetails = ({ title, address, url }: ITokenDetails) => {
  return (
    <div className="text-center text-neutral-700">
      <h3 className="paragraphy-large-bold">{title}</h3>
      <p className="paragraphy-small mb-2">{address}</p>
      <a
        href={url}
        target="_blank"
        className="flex flex-row items-center justify-center gap-3.5 paragraphy-small text-primary-700 underline">
        <img src="/images/etherscan.png" alt="Etherscan" />
        View on Etherscan
      </a>
    </div>
  );
};

export default TokenDetails;
