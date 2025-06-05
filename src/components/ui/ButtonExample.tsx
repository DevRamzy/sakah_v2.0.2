import React, { useState } from 'react';
import Button from './Button';

const ButtonExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Button Component Examples</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Primary Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button>Medium (Default)</Button>
          <Button size="lg">Large</Button>
          <Button isLoading={isLoading} onClick={handleClick}>
            {isLoading ? 'Loading...' : 'Click to Load'}
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Secondary Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary">Medium</Button>
          <Button variant="secondary" size="lg">Large</Button>
          <Button variant="secondary" disabled>Disabled</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Outline Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" size="sm">Small</Button>
          <Button variant="outline">Medium</Button>
          <Button variant="outline" size="lg">Large</Button>
          <Button variant="outline" disabled>Disabled</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Full Width Buttons</h3>
        <div className="space-y-2">
          <Button fullWidth>Primary Full Width</Button>
          <Button variant="secondary" fullWidth>Secondary Full Width</Button>
          <Button variant="outline" fullWidth>Outline Full Width</Button>
        </div>
      </div>
    </div>
  );
};

export default ButtonExample;
