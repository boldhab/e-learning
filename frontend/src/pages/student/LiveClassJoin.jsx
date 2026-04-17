import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const LiveClassJoin = () => <MockModulePage {...modulePageMockData.liveClassJoin} />;

export default LiveClassJoin;
