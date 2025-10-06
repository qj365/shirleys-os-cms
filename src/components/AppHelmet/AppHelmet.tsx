import type { FunctionComponent } from 'react';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

type AppHelmetProps = {
  title?: string;
  description?: string;
  keywords?: string;
  type?: string;
  name?: string;
};

const AppHelmet: FunctionComponent<AppHelmetProps> = props => {
  const { title, description = '', keywords, type = '', name = '' } = props;
  const SEOKeywords = useMemo(
    () => keywords || 'Shirleys Food Manager',
    [keywords]
  );

  const appName = 'Shirleys Food Manager';

  const pageTitle = title ? `${appName} - ${title}` : appName;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="facebook-domain-verification" content={'FACEBOOK_KEY_HERE'} />
      <meta name="description" content={description} />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="robots" content="index, follow" />
      <meta key="googlebot" name="googlebot" content="index,follow" />
      <meta name="google" content="notranslate" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="keywords" content={SEOKeywords} />
      {/*Facebook*/}
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="app_domain" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="app_domain" />
      <meta property="og:image" content="link_to_logo" />
      {/*Twitter*/}
      <meta property="twitter:creator" content={name} />
      <meta property="twitter:card" content={type} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:url" content="app_domain" />
    </Helmet>
  );
};

export default AppHelmet;
