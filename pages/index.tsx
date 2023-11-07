import MediaAsset from '@components/atoms/MediaAsset/MediaAsset';
import useAuth from '@hooks/useAuth';
import { useGlobalContext } from '@providers/global.context';
import { WEBSITE_NAME } from '@utils/constants';
import { AnimatePresence, motion } from 'framer-motion';
import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';

const Home: NextPage = () => {
  const {
    website: { assets, name }
  } = useGlobalContext();
  const { authorizeUser } = useAuth();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        authorizeUser();
      }, 400);
    }, 2000);
  }, []);

  return (
    <div className="w-full h-screen">
      <AnimatePresence mode="wait">
        {!exiting ? (
          <motion.div
            key="intro"
            initial={{
              backgroundColor: '#fff',
              clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 45% 100%, 50% 100%, 50% 100%, 55% 100%, 0 100%)'
              // clipPath: 'polygon(0 0, 100% 0, 100% 0, 100% 0, 100% 0, 0 0, 0 0, 0 0)'
            }}
            animate={{
              backgroundColor: '#e8ebf5',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 45% 100%, 50% 93%, 50% 93%, 55% 100%, 0 100%)'
            }}
            exit={{
              clipPath: [
                'polygon(0 0, 100% 0, 100% 100%, 45% 100%, 50% 93%, 50% 93%, 55% 100%, 0 100%)',
                'polygon(0 0, 100% 0, 100% 100%, 80% 100%, 50% 35%, 50% 35%, 20% 100%, 0 100%)',
                'polygon(0 0, 100% 0, 100% 100%, 100% 100%, 50% 10%, 50% 10%, 0 100%, 0 100%)',
                'polygon(0 0, 100% 0, 100% 100%, 100% 90%, 50% 0, 50% 0, 0 90%, 0 100%)',
                'polygon(0 0, 100% 0, 100% 100%, 100% 70%, 80% 0, 20% 0, 0 70%, 0 100%)',
                'polygon(0 0, 100% 0, 100% 100%, 100% 40%, 85% 0, 15% 0, 0 40%, 0 100%)',
                'polygon(0 0, 100% 0, 100% 100%, 100% 20%, 90% 0, 10% 0, 0 20%, 0 100%)',
                'polygon(0 0, 100% 0, 100% 0, 100% 0, 100% 0, 0 0, 0 0, 0 0)'
              ]
            }}
            transition={{ duration: 0.4 }}
            className="h-full w-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -800 }}
              transition={{ duration: 0.6 }}>
              <MediaAsset
                src={assets?.logoIcon?.src || '/icons/vtvl-icon.svg'}
                className="h-32 md:h-44"
                alt={name || WEBSITE_NAME}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Home;
