import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const SystemBackup = () => <MockModulePage {...modulePageMockData.systemBackup} />;

export default SystemBackup;
