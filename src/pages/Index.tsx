import ShelterHealthApp from './ShelterHealthApp';

const Index = () => {
  return (
    <>
      <ShelterHealthApp />
      
      {/* Test link for checklist functionality */}
      <div className="fixed bottom-4 right-4 z-50">
        <a 
          href="/simple-test"
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors shadow-lg"
        >
          🏠 Test Page
        </a>
      </div>
    </>
  );
};

export default Index;
