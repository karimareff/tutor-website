import React from "react";

const Stats = () => {
    return (
        <section className="py-12 border-b bg-muted/30">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
                    <div className="group hover:-translate-y-1 transition-transform duration-300">
                        <div className="text-4xl md:text-5xl font-bold text-gradient">500+</div>
                        <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Verified Tutors</div>
                    </div>
                    <div className="group hover:-translate-y-1 transition-transform duration-300 delay-100">
                        <div className="text-4xl md:text-5xl font-bold text-gradient">10k+</div>
                        <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Happy Students</div>
                    </div>
                    <div className="group hover:-translate-y-1 transition-transform duration-300 delay-200">
                        <div className="text-4xl md:text-5xl font-bold text-gradient">95%</div>
                        <div className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Success Rate</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Stats;
