import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setFilters } from '@/redux/jobSlice';

const CATEGORIES = [
    { label: "🤖 AI Engineer", value: "AI Engineer" },
    { label: "🛡️ Cybersecurity", value: "Cybersecurity Engineer" },
    { label: "☁️ DevOps", value: "DevOps Engineer" },
    { label: "⚛️ Frontend Dev", value: "Frontend Developer" },
    { label: "🔧 Backend Dev", value: "Backend Developer" },
    { label: "📊 Data Science", value: "Data Scientist" },
    { label: "🧱 Full Stack", value: "Full Stack Developer" },
    { label: "📱 Mobile Dev", value: "Mobile App Developer" },
    { label: "📦 MLOps", value: "MLOps Engineer" },
    { label: "🗃️ Data Engineer", value: "Data Engineer" },
    { label: "🧪 QA Engineer", value: "QA Engineer" },
    { label: "📋 Product Manager", value: "Product Manager" },
    { label: "🔐 Cloud Security", value: "Cloud Security Engineer" },
    { label: "🌐 Cloud Architect", value: "Cloud Architect" },
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleCategoryClick = (category) => {
        dispatch(setFilters({ category }));
        navigate("/jobs");
    };

    return (
        <div className="py-8 bg-gray-50 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 text-center">
                    Browse by Role
                </h2>
                <Carousel className="w-full" opts={{ align: "start", loop: true }}>
                    <CarouselContent className="-ml-2">
                        {CATEGORIES.map((cat) => (
                            <CarouselItem key={cat.value} className="pl-2 basis-auto">
                                <Button
                                    onClick={() => handleCategoryClick(cat.value)}
                                    variant="outline"
                                    className="rounded-full whitespace-nowrap text-sm border-gray-200 hover:border-[#6A38C2] hover:text-[#6A38C2] hover:bg-purple-50 transition-all"
                                >
                                    {cat.label}
                                </Button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="-left-3" />
                    <CarouselNext className="-right-3" />
                </Carousel>
            </div>
        </div>
    )
}

export default CategoryCarousel